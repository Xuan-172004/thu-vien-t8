const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const UserService = require('../services/users.service');

function setCookie(res, token, refreshToken) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000,
    });

    res.cookie('logged', 1, {
        httpOnly: false,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

class UserController {
    async createUser(req, res) {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const { token, refreshToken, user } = await UserService.createUser({ fullName, email, password });

        setCookie(res, token, refreshToken);

        return new OK({ message: 'Tạo user thành công', metadata: { token, refreshToken, user } }).send(res);
    }

    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const data = { email, password };
        const { token, refreshToken, user } = await UserService.login(data);

        setCookie(res, token, refreshToken);
        return new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken, user } }).send(res);
    }

    async auth(req, res) {
        const { id } = req.user;
        const user = await UserService.authUser(id);
        return new OK({
            message: 'Lấy thông tin tài khoản thành công',
            metadata: { user },
        }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        const { status } = await UserService.logout(id);
        if (status === 200) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.clearCookie('logged');
            return new OK({ message: 'Đăng xuất thành công' }).send(res);
        } else {
            throw new BadRequestError('Đăng xuất thất bại');
        }
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(' ')[1];
        if (!refreshToken) {
            throw new BadRequestError('Vui lòng đăng nhập lại');
        }
        const { token } = await UserService.refreshToken(refreshToken);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000,
        });

        return new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async getAllUser(req, res) {
        const data = await UserService.getAllUser(req, res);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async toggleLockUser(req, res) {
        const { id } = req.params;
        const data = await UserService.toggleLockUser(id);
        new OK({
            message: `Đã ${data.status === 'locked' ? 'khóa' : 'mở khóa'} tài khoản thành công`,
            metadata: data,
        }).send(res);
    }

    async createUserAdmin(req, res) {
        const data = await UserService.createUserAdmin(req.body);
        new OK({ message: 'Tạo tài khoản người dùng mới thành công', metadata: data }).send(res);
    }

    async updateUserAdmin(req, res) {
        const { id } = req.params;
        const data = await UserService.updateUserAdmin(id, req.body);
        new OK({ message: 'Cập nhật thông tin người dùng thành công', metadata: data }).send(res);
    }

    async deleteUser(req, res) {
        const { id } = req.params;
        const data = await UserService.deleteUser(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async changePassword(req, res) {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const data = { currentPassword, newPassword };
        const newData = await UserService.changePassword(id, data);
        new OK({ message: 'Đổi mật khẩu thành công', metadata: newData }).send(res);
    }

    async updateUser(req, res) {
        const { id } = req.user;
        const { fullName, address, phone, email } = req.body;
        const data = { fullName, address, phone, email };
        const newData = await UserService.updateUser(id, data);
        new OK({ message: 'success', metadata: newData }).send(res);
    }

    async uploadAvatar(req, res) {
        const { id } = req.user;
        const { filename } = req.file;
        const data = await UserService.uploadAvatar(id, filename);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const { token, refreshToken, user } = await UserService.loginGoogle(credential);
        setCookie(res, token, refreshToken);
        new OK({ message: 'success', metadata: { token, refreshToken, user } }).send(res);
    }

    async forgotPassword(req, res) {
        const { email } = req.body;
        const { token, otp, message } = await UserService.forgotPassword(email);
        new OK({ message, metadata: { token, otp } }).send(res);
    }

    async resetPassword(req, res) {
        const { email, otp, newPassword } = req.body;
        const data = await UserService.resetPassword(email, otp, newPassword);
        new OK({ message: 'Đã đặt lại mật khẩu mới thành công', metadata: data }).send(res);
    }
}

module.exports = new UserController();
