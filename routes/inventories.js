var express = require('express');
var router = express.Router();
let mongoose = require('mongoose')
let inventoryModel = require('../schemas/inventories')
let productModel = require('../schemas/products')

async function getInventoryByProduct(productId) {
  return await inventoryModel.findOne({
    product: productId
  })
}

router.get('/', async function (req, res, next) {
  let result = await inventoryModel.find().populate({
    path: 'product'
  })
  res.send(result)
})

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id
    let result = await inventoryModel.findById(id).populate({
      path: 'product'
    })
    if (!result) {
      return res.status(404).send({
        message: 'INVENTORY NOT FOUND'
      })
    }
    res.send(result)
  } catch (error) {
    res.status(404).send({
      message: 'INVENTORY NOT FOUND'
    })
  }
})

router.post('/add-stock', async function (req, res, next) {
  try {
    let product = req.body.product
    let quantity = Number(req.body.quantity)

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).send({ message: 'INVALID PRODUCT ID' })
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).send({ message: 'QUANTITY MUST BE GREATER THAN 0' })
    }

    let productData = await productModel.findById(product)
    if (!productData || productData.isDeleted) {
      return res.status(404).send({ message: 'PRODUCT NOT FOUND' })
    }

    let inventory = await getInventoryByProduct(product)
    if (!inventory) {
      return res.status(404).send({ message: 'INVENTORY NOT FOUND' })
    }

    inventory.stock += quantity
    await inventory.save()
    res.send(inventory)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/remove-stock', async function (req, res, next) {
  try {
    let product = req.body.product
    let quantity = Number(req.body.quantity)

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).send({ message: 'INVALID PRODUCT ID' })
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).send({ message: 'QUANTITY MUST BE GREATER THAN 0' })
    }

    let inventory = await getInventoryByProduct(product)
    if (!inventory) {
      return res.status(404).send({ message: 'INVENTORY NOT FOUND' })
    }
    if (inventory.stock < quantity) {
      return res.status(400).send({ message: 'NOT ENOUGH STOCK' })
    }

    inventory.stock -= quantity
    await inventory.save()
    res.send(inventory)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/reservation', async function (req, res, next) {
  try {
    let product = req.body.product
    let quantity = Number(req.body.quantity)

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).send({ message: 'INVALID PRODUCT ID' })
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).send({ message: 'QUANTITY MUST BE GREATER THAN 0' })
    }

    let inventory = await getInventoryByProduct(product)
    if (!inventory) {
      return res.status(404).send({ message: 'INVENTORY NOT FOUND' })
    }
    if (inventory.stock < quantity) {
      return res.status(400).send({ message: 'NOT ENOUGH STOCK' })
    }

    inventory.stock -= quantity
    inventory.reserved += quantity
    await inventory.save()
    res.send(inventory)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/sold', async function (req, res, next) {
  try {
    let product = req.body.product
    let quantity = Number(req.body.quantity)

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).send({ message: 'INVALID PRODUCT ID' })
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).send({ message: 'QUANTITY MUST BE GREATER THAN 0' })
    }

    let inventory = await getInventoryByProduct(product)
    if (!inventory) {
      return res.status(404).send({ message: 'INVENTORY NOT FOUND' })
    }
    if (inventory.reserved < quantity) {
      return res.status(400).send({ message: 'NOT ENOUGH RESERVED' })
    }

    inventory.reserved -= quantity
    inventory.soldCount += quantity
    await inventory.save()
    res.send(inventory)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router;
