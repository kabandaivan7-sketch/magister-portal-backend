router.post("/", auth, adminOnly, createPost);
router.post("/:id/react", auth, reactPost);
router.post("/:id/comment", auth, commentPost);

function adminOnly(req,res,next){
  if(req.user.email!=="kabandaivan7@gmail.com")
    return res.status(403).json({message:"Admin only"});
  next();
}
