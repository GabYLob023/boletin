const express=require("express");
const router=express.Router();
const link=require("../db/link")

router.get("/iniciar.ejs", (req, res) => {
    res.render("iniciar",{link});
});

module.exports=router;