const express=require("express");
const router=express.Router();
const link=require("../db/link")

router.get("/alumno", function (req,res){
    if(!req.session.login){
        res.render("registro", {link});
    } else{
        res.render("alumno", {user:req.session, link});
    }
});

module.exports=router;