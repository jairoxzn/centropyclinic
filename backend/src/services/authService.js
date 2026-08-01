const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken } = require('../helpers/jwt');
const { UnauthorizedError, NotFoundError, ConflictError, AppError } = require('../helpers/errors');
const { sendEmail } = require('../config/mailer');
const config = require('../config');

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Cuenta desactivada');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.update(user.id, {
      refreshToken,
      lastLogin: new Date(),
    });

    const { password: _, resetToken: __, resetExpires: ___, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token) {
    if (!token) throw new UnauthorizedError('Token no proporcionado');

    try {
      const decoded = verifyRefreshToken(token);
      const user = await userRepository.findById(decoded.id);

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Token inválido');
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      await userRepository.update(user.id, { refreshToken: newRefreshToken });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }

  async logout(userId) {
    await userRepository.update(userId, { refreshToken: null });
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.update(user.id, { resetToken, resetExpires });

    const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'PsyClinic Pro - Recuperar contraseña',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1E40AF; margin-bottom: 24px;">Recuperar contraseña</h2>
          <p style="color: #475569; line-height: 1.6;">Hola, recibimos una solicitud para restablecer tu contraseña.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin: 24px 0; font-weight: 600;">Restablecer contraseña</a>
          <p style="color: #94A3B8; font-size: 14px;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `,
    });

    return { message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' };
  }

  async resetPassword(token, newPassword) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetExpires: null,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuario');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('La contraseña actual es incorrecta', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.update(userId, { password: hashedPassword });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuario');

    const { password, refreshToken, resetToken, resetExpires, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new AuthService();
