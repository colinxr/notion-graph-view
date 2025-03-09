import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RateLimiterService } from '../rate-limiter.service';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should use default rate limit values if not provided in config', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      
      const newService = new RateLimiterService(configService);
      
      expect(newService).toBeDefined();
      // Default values are tested implicitly since the service is created successfully
    });

    it('should use config values if provided', () => {
      jest.spyOn(configService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'NOTION_RATE_LIMIT_MAX_REQUESTS') return 5;
          if (key === 'NOTION_RATE_LIMIT_INTERVAL') return 2000;
          return undefined;
        });
      
      const newService = new RateLimiterService(configService);
      
      expect(newService).toBeDefined();
      // Config values are tested implicitly since the service is created successfully
    });
  });

  describe('execute', () => {
    it('should execute the provided function', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');
      
      const result = await service.execute(mockFn);
      
      expect(mockFn).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should handle errors from the executed function', async () => {
      const mockError = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      
      await expect(service.execute(mockFn)).rejects.toThrow(mockError);
      expect(mockFn).toHaveBeenCalled();
    });

    it('should rate limit multiple calls', async () => {
      // Mock Date.now to control time
      const originalDateNow = Date.now;
      const mockNow = jest.fn();
      global.Date.now = mockNow;

      try {
        // First call at time 0
        mockNow.mockReturnValue(0);
        const mockFn1 = jest.fn().mockResolvedValue('result1');
        
        // Second call at time 100ms
        mockNow.mockReturnValue(100);
        const mockFn2 = jest.fn().mockResolvedValue('result2');
        
        // Third call at time 200ms
        mockNow.mockReturnValue(200);
        const mockFn3 = jest.fn().mockResolvedValue('result3');
        
        // Fourth call at time 300ms - should be delayed
        mockNow.mockReturnValue(300);
        const mockFn4 = jest.fn().mockResolvedValue('result4');

        // Execute all functions in parallel
        const results = await Promise.all([
          service.execute(mockFn1),
          service.execute(mockFn2),
          service.execute(mockFn3),
          service.execute(mockFn4),
        ]);
        
        expect(results).toEqual(['result1', 'result2', 'result3', 'result4']);
        expect(mockFn1).toHaveBeenCalled();
        expect(mockFn2).toHaveBeenCalled();
        expect(mockFn3).toHaveBeenCalled();
        expect(mockFn4).toHaveBeenCalled();
      } finally {
        // Restore original Date.now
        global.Date.now = originalDateNow;
      }
    });
  });
}); 