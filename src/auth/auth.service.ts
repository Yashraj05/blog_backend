import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { generateRandomPassword } from './utils/generatepass';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { name, email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: User }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.jwtService.sign({ id: user._id });

    return { user, token };
  }
  async getUserById(id: string) {
    return await this.userModel.findById(id);
  }
  async validateGoogleUser(profile: any) {
    const existingUser = await this.userModel.findOne({
      email: profile.emails[0].value,
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = new this.userModel({
      name: profile.displayName,
      email: profile.emails[0].value,
      password: generateRandomPassword(6),
    });

    // Save the new user to the database
    await newUser.save();

    return newUser;
  }
  async googleLogin(user: User) {
    const token = this.jwtService.sign({ id: user._id });
    console.log(user);
    return { token };
  }
}
