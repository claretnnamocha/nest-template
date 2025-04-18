import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import * as randomstring from 'randomstring';
import { DataTypes, UUIDV4 } from 'sequelize';
import { Column, IsUUID, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserRoles, UserStatuses } from './types';

@Table({
  tableName: 'user',
  hooks: {
    async afterCreate(attributes) {
      const user = attributes;
      const totp = authenticator.generateSecret();
      const referralCode = randomstring.generate(7);
      await user.update({ totp, referralCode });
    },
    async afterBulkCreate(users) {
      for (let index = 0; index < users.length; index += 1) {
        const user = users[index];
        const totp = authenticator.generateSecret();
        const referralCode = randomstring.generate(7);
        await user.update({ totp, referralCode });
      }
    },
  },
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @IsUUID('4')
  @PrimaryKey
  @Column({
    defaultValue: UUIDV4,
    type: DataTypes.STRING,
  })
  public id!: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  public email!: string;

  @Column({ type: DataTypes.STRING })
  public firstName!: string;

  @Column({ type: DataTypes.STRING })
  public lastName!: string;

  @Column({ type: DataTypes.STRING })
  public otherNames!: string;

  @Column({ type: DataTypes.STRING })
  public avatar!: string;

  @Column({
    type: DataTypes.STRING,
    values: Object.values(UserRoles),
    defaultValue: UserRoles.user,
  })
  public role!: UserRoles;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: UserStatuses.active,
    values: Object.values(UserStatuses),
  })
  public status!: UserStatuses;

  @Column({ type: DataTypes.STRING })
  public phone!: string;

  @Column({
    type: DataTypes.STRING,
    set(value: string) {
      const salt = bcrypt.genSaltSync();
      this.setDataValue('password', bcrypt.hashSync(value, salt));
    },
  })
  public password!: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  public verifiedEmail!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  public enable2FA!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  public verifiedPhone!: boolean;

  @Column({ type: DataTypes.TEXT })
  public totp!: string;

  @Column({
    type: DataTypes.STRING,
  })
  public lastLoggedInAt!: string;

  toJSON() {
    const data = { ...this.dataValues };
    delete data.password;
    delete data.totp;
    delete data.deletedAt;
    delete data.lastLoggedInAt;

    return data;
  }

  validatePassword(val: string) {
    return bcrypt.compareSync(val, this.password);
  }

  validateTotp(token: string, digits = 6, window = 0.5) {
    authenticator.options = { digits, step: window * 60 };
    return authenticator.check(token, this.totp);
  }

  generateTotp(digits = 6, window = 5) {
    authenticator.options = { digits, step: window * 60 };
    return authenticator.generate(this.totp);
  }

  async regenerateOtpSecret() {
    const user = await User.findByPk(this.id);
    if (user) {
      user.update({ totp: authenticator.generateSecret() });
    }
  }
}
