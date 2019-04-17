import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import constants from "../../../helpers/constants";
import models from "../../../models";

const { INTERNAL_SERVER_ERROR, OK } = constants.statusCode;
const { SERVER_ERROR } = constants.errorMessage;

const { User } = models;
dotenv.config();
class socialAuthController {
  /**
   * @description create a user from social authentication profile
   * @param  {object} profile - user data from social website (eg : twitter, google , or facebook)
   * @return {User} - a user from the database
   */
  static async createUserFromSocial(profile) {
    const options = {
      where: { $or: [{ socialId: profile.id }] },
      raw: true,
      defaults: {
        firstName: profile.displayName,
        isVerified: true,
        socialId: profile.id,
        username: profile.username
      }
    };
    if (profile.provider === "twitter") {
      options.where.$or.push({ username: profile.username });
      options.defaults.email = `${profile.username}@ah.com`;
    } else {
      options.where.$or.push({ email: profile.emails[0].value });
      options.defaults.email = profile.emails[0].value;
    }
    try {
      const user = await User.findOrCreate(options);
      return user[0] ? user[0] : false;
    } catch (error) {
      return new Error({ message: SERVER_ERROR });
    }
  }

  /**
   * @description when the authentication with social media is done login the user and redirect to his profile
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @return {res} res - Response object
   * @memberof UserController
   */
  static async socialLogin(req, res) {
    const user = await this.createUserFromSocial(req.user);
    if (user) {
      const token = jwt.sign(
        {
          email: user.email,
          username: user.username,
          id: user.id,
          roleId: user.roleId
        },
        process.env.SECRET_KEY
      );
      return res.status(OK).send({
        message: "Logged in successfully",
        token
      });
    }
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: SERVER_ERROR
    });
  }
}

export default socialAuthController;
