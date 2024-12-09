const express=require("express");
const router=express.Router();
const link=require("../db/link")

router.get("/registro2.ejs", (req, res) => {
    res.render("registro2",{link});
});

module.exports=router;
