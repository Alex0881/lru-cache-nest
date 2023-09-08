import { Injectable } from '@nestjs/common';
import { GetValueKeyResponseDto } from './dto/getValueKeyResponse.dto';
import { SetValueKeyDto } from './dto/setValueKey.dto';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import {
  LIVE_TIME_MUTEX_KEY,
  MAX_SET_MUTEX_EFFORTS,
  MS_IN_SECOND,
} from '../common/constants/constants';
import { sleep } from '../common/lib/lib-functions';
import {
  KeyGettingException,
  KeyNotFoundException,
  KeySettingException,
  MutexSettingException,
} from '../customExceptions/customExceptions';

@Injectable()
export class LruService {
  private readonly mutexName;
  private readonly appPrefix;
  private readonly maxCacheSize;
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.appPrefix = `${this.configService.get('APP_PREFIX')}`;
    this.mutexName = `${this.appPrefix}mutex`;
    this.maxCacheSize = this.configService.get('MAX_CACHE_SIZE');
  }

  private getKeyNameForRedis(key: string) {
    return `${this.appPrefix}${key}`;
  }

  private deleteMutexKey() {
    try {
      // удаляем ключ мьютекса
      this.redis.del(this.mutexName);
    } catch (e) {
      // ничего не делаем, даже если отвалилось соединение,
      // то самоистекющий ключ мьютекса сам уничтожится
    }
  }

  async setKeyValue(keyName: string, dto: SetValueKeyDto): Promise<void> {
    // ставим мьютекс, TTL мьютекса меньше чем суммарный интервал попыток,
    // т о либо он поставится, либо выбросит исключение
    // а если наш процесс неожиданно упадет, то флаг мьютекса самоуничтожится
    // и повторно запущенный процесс сможет работать нормально
    let mutexWasSetted = false;
    for (let i = 0; i < MAX_SET_MUTEX_EFFORTS; i++) {
      try {
        mutexWasSetted = await this.redis.set(
          this.mutexName,
          '',
          'NX',
          'PX',
          LIVE_TIME_MUTEX_KEY,
        );
      } catch {
        throw new MutexSettingException(keyName);
      }

      if (mutexWasSetted) {
        break;
      }

      await sleep(MS_IN_SECOND);
    }

    if (!mutexWasSetted) {
      throw new MutexSettingException(keyName);
    }

    // можно добавлять с 0 приоритетом, но тогда только что установленные
    // значения будут удаляться в первую очередь при достижении лимита размера
    // будем ставить значение текущей даты в секундах в качестве приоритета,
    // тогда только что рассчитанные значения будут жить дольше,
    // будет считаться что их последний раз использования был при создании

    let currentCacheSize;
    try {
      currentCacheSize = await this.redis.zcard(this.appPrefix);
    } catch (e) {
      this.deleteMutexKey();
      throw new KeySettingException(keyName);
    }

    const keyNameForRedis = this.getKeyNameForRedis(keyName);

    try {
      if (currentCacheSize >= this.maxCacheSize) {
        // у нас проверка при старте что размер очереди не менее 1,
        // так что обращение к 0 индексу будет корректно всегда
        const keyNameForDelete = (
          await this.redis.zrange(this.appPrefix, 0, 0)
        )[0];

        await this.redis
          .multi()
          .del(keyNameForDelete)
          .zrem(this.appPrefix, keyNameForDelete)
          .zadd(
            this.appPrefix,
            Math.floor(Date.now() / MS_IN_SECOND),
            keyNameForRedis,
          )
          .set(keyNameForRedis, dto.value)
          .del(this.mutexName)
          .exec();
      } else {
        await this.redis
          .multi()
          .zadd(
            this.appPrefix,
            Math.floor(Date.now() / MS_IN_SECOND),
            keyNameForRedis,
          )
          .set(keyNameForRedis, dto.value)
          .del(this.mutexName)
          .exec();
      }
    } catch (e) {
      this.deleteMutexKey();
      throw new KeySettingException(keyName);
    }
  }

  async getKeyValue(keyName: string): Promise<GetValueKeyResponseDto> {
    let plResult, result;
    const keyNameForRedis = this.getKeyNameForRedis(keyName);
    try {
      plResult = await this.redis
        .multi()
        .zadd(
          this.appPrefix,
          'XX',
          Math.floor(Date.now() / MS_IN_SECOND),
          keyNameForRedis,
        )
        .get(keyNameForRedis)
        .exec();
    } catch (e) {
      throw new KeySettingException(keyName);
    }

    if (!plResult[1][0]) {
      result = plResult[1][1];
      if (result === null) {
        throw new KeyNotFoundException(keyName);
      }
    } else {
      throw new KeyGettingException(keyName);
    }
    return { value: result };
  }
}
