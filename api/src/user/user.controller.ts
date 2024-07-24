import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './user.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getJobSearchResults(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException()
    }

    const user = await this.userService.findById(req.user.id)
    return {
      ...user,
      password: undefined,
    }
  }
}
