function errorHandler(err, req, res, next) {
	if (err && err.name === "UnauthorizedError") {
		return res.status(401).json({ message: "Unauthorized User" })
	}

	if (err && err.name === "ValidationError") {
		return res.status(401).json({ message: "Unauthorized User" })
	}

    if(err){
        return res.status(500).json({message:err.name})
    }
}

module.exports = errorHandler
