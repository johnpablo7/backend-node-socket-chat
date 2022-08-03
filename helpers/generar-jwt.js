const jwt = require("jsonwebtoken");
const { Usuario } = require('../models');

const generarJWT = (uid = "") => {
  return new Promise((resolve, reject) => {
    const payload = { uid };

    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: "30d", // El tiempo de duración del token
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

const comprobarJWT = async (token = '') => {

  try {
    if (token.length < 10) {
      return null;
    }

    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
    const usuario = await Usuario.findById(uid);

    return usuario?.estado ? usuario : null
  } catch (error) {
    return null;
  }
}

module.exports = {
  generarJWT,
  comprobarJWT
};
