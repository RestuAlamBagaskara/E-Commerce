const Category = require("../models/category")
const Product = require("../models/products")
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const multer = require("multer")
const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
}
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValid = FILE_TYPE_MAP[file.mimetype]
		let uploadError = new Error("Invalid image extension")
		if (isValid) {
			uploadError = null
		}
		cb(uploadError, "public/uploads")
	},
	filename: function (req, file, cb) {
		const fileName = file.originalname.replace(" ", "-")
		const extension = FILE_TYPE_MAP[file.mimetype]
		cb(null, `${fileName}-${Date.now()}.${extension}`)
	},
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
	let filter = {}
	if (req.query.categories) {
		filter = { category: req.query.categories.split(",") }
	}
	const productList = await Product.find(filter).select("name price")
	if (!productList) {
		res.status(500).json({
			success: false,
		})
	}
	res.send(productList)
})

router.get(`/:id`, async (req, res) => {
	const product = await Product.findById(req.params.id).populate("category")
	if (!product) {
		res.status(500).json({
			success: false,
		})
	}
	res.send(product)
})

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
	const category = await Category.findById(req.body.category)
	if (!category) {
		return res.status(400).send("Invalid Category")
	}
	const file = req.file
	if (!file) {
		return res.status(400).send("No Image in The Request")
	}
	const fileName = req.file.filename
	const path = `${req.protocol}://${req.get("host")}/public/uploads/${fileName}`
	let product = new Product({
		name: req.body.name,
		description: req.body.description,
		richDescription: req.body.richDescription,
		image: path,
		brand: req.body.brand,
		price: req.body.price,
		category: req.body.category,
		countInStock: req.body.countInStock,
		rating: req.body.rating,
		numReviews: req.body.numReviews,
		isFeatured: req.body.isFeatured,
	})
	product = await product.save()
	if (!product) {
		return res.status(500).send("Product Cant't be Created")
	}
	res.send(product)
})

router.put("/:id", async (req, res) => {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).send("Invalid Id")
	}
	const category = await Category.findById(req.body.category)
	if (!category) {
		return res.status(400).send("Invalid Category")
	}

	const checkProduct = await Product.findById(req.params.id)
	if (!checkProduct) {
		return res.status(400).send("Invalid Product")
	}

	const file = req.file
	let imagePath

	if (file) {
		const fileName = file.filename
		const path = `${req.protocol}://${req.get("host")}/public/uploads/`
		imagePath = `${path}${fileName}`
	} else {
		imagePath = product.image
	}

	const product = await Product.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: imagePath,
			brand: req.body.brand,
			price: req.body.price,
			category: req.body.category,
			countInStock: req.body.countInStock,
			rating: req.body.rating,
			numReviews: req.body.numReviews,
			isFeatured: req.body.isFeatured,
		},
		{ new: true }
	)

	if (!product) {
		return res.status(500).send("Cant't be Updated")
	}

	res.send(product)
})

router.delete("/:id", (req, res) => {
	Product.findByIdAndRemove(req.params.id)
		.then((product) => {
			if (product) {
				return res.status(200).json({
					success: true,
					message: "Product Deleted",
				})
			} else {
				return res.status(404).json({
					success: false,
					message: "Product Not Found",
				})
			}
		})
		.catch((err) => {
			return res.status(400).json({
				success: false,
				error: err,
			})
		})
})

router.get("/get/count", async (req, res) => {
	const productCount = await Product.countDocuments()
	if (!productCount) {
		res.status(500).json({
			success: false,
		})
	}
	res.send({ productCount: productCount })
})

router.get("/get/featured/:count", async (req, res) => {
	const count = req.params.count ? req.params.count : 0
	const productFeatured = await Product.find({ isFeatured: true })
		.limit(count)
		.select("name price")
	if (!productFeatured) {
		res.status(500).json({
			success: false,
		})
	}
	res.send({ productFeatured: productFeatured })
})

router.put(
	"/catalog/:id",
	uploadOptions.array("images", 10),
	async (req, res) => {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).send("Invalid Id")
		}

		const path = `${req.protocol}://${req.get("host")}/public/uploads/`
		const files = req.files
		let imagesPaths = []
		if (files) {
			files.map((file) => {
				imagesPaths.push(`${path}${file.filename}`)
			})
		}
		const product = await Product.findByIdAndUpdate(
			req.params.id,
			{
				images: imagesPaths,
			},
			{ new: true }
		)

		if (!product) {
			return res.status(500).send("Cant't be Updated")
		}

		res.send(product)
	}
)

module.exports = router
