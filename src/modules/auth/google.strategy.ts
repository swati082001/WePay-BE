import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Profile, Strategy } from "passport-google-oauth20";
import { UsersService } from "../users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly usersService: UsersService,
        private readonly config: ConfigService,
    ) {
        super({
            clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: config.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3000/auth/google/callback'),
            scope: ['email', 'profile'],
        });
    }
    
    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ) {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            throw new Error('Google did not provide an email');
        }

        const firstName = profile.name?.givenName ?? '';
        const lastName = profile.name?.familyName ?? '';
        const picture = profile.photos?.[0]?.value ?? null;

        try {
            const existingUser = await this.usersService.findByEmail(email);
            if (existingUser) {
                return this.usersService.toResponse(existingUser);
            }
            const newUser = await this.usersService.create({
                email,
                firstName,
                lastName,
                avatarUrl: picture,
            });
            return this.usersService.toResponse(newUser);
        } catch (error) {
            throw error;
        }
    }
}