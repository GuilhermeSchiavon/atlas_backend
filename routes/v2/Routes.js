const router = require('express').Router();


router.get('/', (req, res) => {
    res.json({name: 'API - V2', status: 'online'});
});

const adm = require("./admRoutes")
router.use("/adms", adm);

const user = require("./user_Routes")
router.use("/users", user);

const category = require("./category_Routes")
router.use("/categories", category);

const password = require("./password_Routes")
router.use("/password", password);

const email = require("./email_Routes")
router.use("/send", email);

// Atlas Dermatológico routes
const chapter = require("./chapterRoutes")
router.use("/chapters", chapter);

const publication = require("./publicationRoutes")
router.use("/publications", publication);

const image = require("./imageRoutes")
router.use("/images", image);

 module.exports = router