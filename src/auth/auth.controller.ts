import {
  Body,
  ClassSerializerInterceptor,
  // ClassSerializerInterceptor,
  Controller,
  Get,
  // Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  // UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
// import { UserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/user.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.authService.login(loginDto);
    const userDto = new UserDto();
    userDto.name = user.name;
    userDto.email = user.email;
    userDto.password = user.password;
    userDto.posts = user.posts;

    return { token, userDto };
  }
  // @UseInterceptors(ClassSerializerInterceptor)
  // @Get(':id')
  // async getUser(@Param('id') id: string): Promise<UserDto> {
  //   const user = await this.authService.getUserById(id);
  //   const userDto = new UserDto();
  //   userDto.name = user.name;
  //   userDto.email = user.email;
  //   userDto.password = user.password;
  //   userDto.posts = user.posts;
  //   console.log(userDto);
  //   return userDto;
  // }
  // @Get()
  // async test() {
  //   return `<button><a href='/auth/google'>Login With Google</a></button>`;
  // }
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  @UseInterceptors(ClassSerializerInterceptor)
  async googleLoginCallback(@Req() req) {
    const newuser = req.user;
    const { token, user } = await this.authService.googleLogin(newuser);
    const userDto = new UserDto();
    userDto.name = user.name;
    userDto.email = user.email;
    userDto.password = user.password;
    userDto.posts = user.posts;

    return { token, userDto };
  }
}
