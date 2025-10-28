const router = require('express').Router();


router.get('/', (req, res) => {
    res.json({name: 'API - V2', status: 'online'});
});

const adm = require("./admRoutes")
router.use("/adms", adm);

const user = require("./User_Routes")
router.use("/users", user);

const category = require("./Category_Routes")
router.use("/categories", category);

const password = require("./Password_Routes")
router.use("/password", password);

const email = require("./Email_Routes")
router.use("/send", email);

const pdf = require("./PDF_Routes")
router.use("/pdf", pdf);

// Atlas Dermatológico routes
const chapter = require("./chapterRoutes")
router.use("/chapters", chapter);

const publication = require("./publicationRoutes")
router.use("/publications", publication);

const image = require("./imageRoutes")
router.use("/images", image);

 module.exports = router