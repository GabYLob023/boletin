const express=require("express");
const router=express.Router();
const link=require("../db/link")

router.get("/registro.ejs", (req, res) => {
    res.render("registro",{link});
});

module.exports=router;
