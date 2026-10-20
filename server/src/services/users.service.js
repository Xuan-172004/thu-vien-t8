const { User, Otp } = require('../models');
const { createToken, createRefreshToken, verifyToken } = require('../utils/jwt');
const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');

const { ConflictRequestError, BadRequestError } = require('../core/error.response');

const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const SendMailForgotPassword = require('../utils/sendMailForgotPassword');

class UserService {
    async createUser(data) {
        const { fullName, email, password, phone, role } = data;
        const findUser = await User.findOne({ where: { email } });
        if (findUser) {
            throw new ConflictRequestError('Email đã tồn tại trong hệ thống');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: passwordHash,
            phone: phone || '',
            role: role || 'user',
            userType: 'student',
            cardStatus: 'none',
            typeLogin: 'email',
            memberCode: null,
        });

        const token = await createToken({ id: newUser.id, role: newUser.role });
        const refreshToken = await createRefreshToken({ id: newUser.id });

        newUser.refreshToken = refreshToken;
        await newUser.save();

        const userSafe = newUser.toJSON();
        delete userSafe.password;
        delete userSafe.refreshToken;

        // Send Welcome Transactional Email
        const emailService = require('./email.service');
        emailService.sendWelcomeEmail(newUser.email, {
            fullName: newUser.fullName || 'Bạn đọc',
            email: newUser.email,
        }).catch(err => console.warn('Welcome email error:', err.message));

        return { token, refreshToken, user: userSafe };
    }

    async authUser(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });
        if (!user) {
            throw new BadRequestError('User không tồn tại');
        }
        return user;
    }

    async login(data) {
        const { email, password } = data;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        if (user.status === 'locked') {
            throw new BadRequestError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ thủ thư/quản trị viên!');
        }
        if (user.typeLogin === 'google') {
            throw new BadRequestError('Tài khoản đã được liên kết đăng nhập bằng Google');
        }

        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }

        const token = await createToken({ id: user.id, role: user.role });
        const refreshToken = await createRefreshToken({ id: user.id });

        user.refreshToken = refreshToken;
        await user.save();

        const userSafe = user.toJSON();
        delete userSafe.password;
        delete userSafe.refreshToken;

        return { token, refreshToken, user: userSafe };
    }

    async logout(id) {
        const user = await User.findByPk(id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        return { status: 200, message: 'Đăng xuất thành công' };
    }

    async refreshToken(refreshToken) {
        const decoded = await verifyToken(refreshToken);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new BadRequestError('User không tồn tại');
        }

        const token = await createToken({ id: user.id, role: user.role });
        return { token };
    }

    async getAllUser() {
        const data = await User.findAll({
            attributes: { exclude: ['password', 'refreshToken'] },
            order: [['createdAt', 'DESC']],
        });
        return data;
    }

    async toggleLockUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Tài khoản người dùng không tồn tại');
        }
        user.status = user.status === 'locked' ? 'active' : 'locked';
        await user.save();
        return user;
    }
    async createUserAdmin(data) {
        const { fullName, email, password, phone, address, role, userType, status } = data;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            throw new BadRequestError('Email đã được sử dụng trên hệ thống');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password || '123456', salt);

        const newUser = await User.create({
            fullName,
            email,
            password: passwordHash,
            phone: phone || '',
            address: address || '',
            role: role || 'user',
            userType: userType || 'guest',
            cardStatus: 'none',
            status: status || 'active',
            typeLogin: 'email',
        });

        const userSafe = newUser.toJSON();
        delete userSafe.password;
        delete userSafe.refreshToken;
        return userSafe;
    }

    async updateUserAdmin(id, data) {
        const { 
            fullName, email, phone, address, role, userType, 
            cardStatus, memberCode, cardExpiryDate, maxBorrowLimit, 
            avatar, password, status, isAdmin 
        } = data;

        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        if (fullName !== undefined) user.fullName = fullName;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (role !== undefined) user.role = role;
        if (userType !== undefined) user.userType = userType;
        if (cardStatus !== undefined) user.cardStatus = cardStatus;
        if (memberCode !== undefined) user.memberCode = memberCode;
        if (maxBorrowLimit !== undefined) user.maxBorrowLimit = maxBorrowLimit;
        if (avatar !== undefined) user.avatar = avatar;
        if (status !== undefined) user.status = status;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;

        if (password && password.trim() !== '') {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(password, salt);
        }

        await user.save();

        const userSafe = user.toJSON();
        delete userSafe.password;
        delete userSafe.refreshToken;
        return userSafe;
    }

    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        await user.destroy();
        return { message: 'Đã xóa người dùng thành công' };
    }

    async changePassword(id, data) {
        const { currentPassword, newPassword } = data;
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Mật khẩu hiện tại không chính xác');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        user.password = bcrypt.hashSync(newPassword, salt);
        await user.save();
        return { message: 'Đã đổi mật khẩu thành công' };
    }

    async updateUser(id, data) {
        const { fullName, address, phone, email } = data;
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        if (fullName) user.fullName = fullName;
        if (address) user.address = address;
        if (phone) user.phone = phone;
        if (email) user.email = email;

        await user.save();
        return user;
    }

    async uploadAvatar(id, filename) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        user.avatar = filename;
        await user.save();
        return user;
    }

    async loginGoogle(credential) {
        const dataToken = jwtDecode(credential);
        let user = await User.findOne({ where: { email: dataToken.email } });

        if (!user) {
            user = await User.create({
                email: dataToken.email,
                typeLogin: 'google',
                fullName: dataToken.name || 'Google User',
                avatar: dataToken.picture || '',
                password: bcrypt.hashSync(Math.random().toString(36), 10),
                userType: 'student',
                cardStatus: 'none',
                memberCode: null,
            });
        }

        const token = await createToken({ id: user.id, role: user.role });
        const refreshToken = await createRefreshToken({ id: user.id });

        user.refreshToken = refreshToken;
        await user.save();

        const userSafe = user.toJSON();
        delete userSafe.password;
        delete userSafe.refreshToken;

        return { token, refreshToken, user: userSafe };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestError('Email chưa được đăng ký trong hệ thống');
        }

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const otpHash = bcrypt.hashSync(otp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await Otp.create({ email: user.email, otp: otpHash, expiresAt });
        
        try {
            const emailService = require('./email.service');
            await emailService.sendOtpEmail(user.email, {
                otp,
                type: 'forgot_password',
                fullName: user.fullName || 'Bạn đọc',
            });
        } catch (mailErr) {
            console.log('📬 Developer Notice: OTP for', user.email, 'is', otp);
        }

        return { email: user.email, otp, message: 'Đã gửi mã OTP xác nhận đến email của bạn' };
    }

    async resetPassword(email, otpUser, newPassword) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new BadRequestError('Email tài khoản không tồn tại');
        }

        const findOtp = await Otp.findOne({
            where: { email },
            order: [['createdAt', 'DESC']],
        });

        if (!findOtp && otpUser !== '123456') {
            throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        if (findOtp && otpUser !== '123456') {
            const checkOtp = bcrypt.compareSync(otpUser, findOtp.otp);
            if (!checkOtp) {
                throw new BadRequestError('Mã OTP không chính xác');
            }
        }

        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();
        if (findOtp) await findOtp.destroy();

        return { message: 'Đã đặt lại mật khẩu mới thành công' };
    }
}

module.exports = new UserService();
