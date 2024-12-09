const express=require("express");
const router=express.Router();
const link=require("../db/link")


router.get("/", (req, res) => {
    res.render("index",{link});
});

module.exports=router;