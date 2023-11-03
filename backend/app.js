const express = require("express")
const app = express()
const morgan = require("morgan")
const mongoose = require("mongoose")
const cors = require("cors")
const authJwt = require("./helpers/jwt")
const errorHandler = require("./helpers/error-handler")
const PORT = 3000

require("dotenv/config")
app.use(cors())
app.options("*", cors())

// Middleware
app.use(express.json())
app.use(morgan("tiny"))
app.use(authJwt())
app.use(errorHandler)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

// Routers
const categoriesRoutes = require("./routes/categories")
const productsRoutes = require("./routes/products")
const usersRoutes = require("./routes/users")
const ordersRoutes = require("./routes/orders")

const api = process.env.API_URL

app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)

mongoose
	.connect(process.env.CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		dbName: "E-commerce",
	})
	.then(() => {
		console.log("Database is ready")
	})
	.catch((err) => {
		console.log(err)
	})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
