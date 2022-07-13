const { response } = require("express");
const { ObjectId } = require('mongoose').Types;

const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
  'usuarios',
  'categorias',
  'productos',
  'productos-categoria',
  'roles'
];

const buscarUsuarios = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const usuario = await Usuario.findById(termino);
    return res.json({
      results: (usuario) ? [usuario] : []
    });
  }

  const regex = new RegExp(termino, 'i')
  const usuarios = await Usuario.count({
    $or: [{ nombre: regex }, { correo: regex }],
    $and: [{ estado: true }]
  });

  res.json({
    results: usuarios
  });
}

const buscarCategorias = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const categoria = await Categoria.findById(termino);
    return res.json({
      results: (categoria) ? [categoria] : []
    });
  }

  const regex = new RegExp(termino, 'i')
  const categorias = await Categoria.find({ nombre: regex, estado: true });

  res.json({
    results: categorias
  });
}

const buscarProductos = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const producto = await Producto.findById(termino)
      .populate('categoria', 'nombre');
    return res.json({
      results: (producto) ? [producto] : []
    });
  }

  const regex = new RegExp(termino, 'i')
  const productos = await Producto.find({ nombre: regex, estado: true })
    .populate('categoria', 'nombre');

  res.json({
    results: productos
  });
}

const buscarProductosPorCategoria = async (termino, res = response) => {
  try {
    const esMongoID = ObjectId.isValid(termino); // TRUE

    // Compruebe si es una identificación válida de mongodb
    if (esMongoID) {
      const productos = await Producto
        .find({ categoria: ObjectId(termino), estado: true })
        .select('nombre precio descripcion disponible')
        .populate('categoria', 'nombre');
      return res.json({
        results: productos
      });
    }

    const regex = new RegExp(termino, 'i')
    const categorias = await Categoria.find({ nombre: regex, estado: true });

    if (!categorias.length) {
      return res.status(400).json({ msg: `No hay resultados con:(${termino}) término de busqueda!` });
    }

    const productos = await Producto.find({
      $or: [...categorias.map(c => { return { categoria: c._id } })],
      $and: [{ estado: true }]
    })
      .select('nombre precio descripcion disponible')
      .populate('categoria', 'nombre');


    res.json({ results: productos });
  } catch (error) {
    res.status(400).json(error)
  }
}


const buscar = async (req, res = response) => {
  const { coleccion, termino } = req.params;

  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`
    })
  }

  switch (coleccion) {
    case 'usuarios':
      buscarUsuarios(termino, res);
      break;

    case 'categorias':
      buscarCategorias(termino, res);
      break;

    case 'productos':
      buscarProductos(termino, res);
      break;

    case 'productos-categoria':
      buscarProductosPorCategoria(termino, res);
      break;

    default:
      res.status(500).json({
        msg: 'Se le olvido hacer esta búsqueda'
      })
  }
}

module.exports = {
  buscar,
}