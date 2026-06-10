import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import { loginSchema, type LoginInput } from '@exlege/types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

const refreshSchema = z.object({ refreshToken: z.string().min(64) });
type RefreshInput = z.infer<typeof refreshSchema>;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) input: LoginInput) {
    return this.auth.login(input);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body(new ZodValidationPipe(refreshSchema)) input: RefreshInput) {
    return this.auth.refresh(input.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body(new ZodValidationPipe(refreshSchema)) input: RefreshInput) {
    return this.auth.logout(input.refreshToken);
  }
}
