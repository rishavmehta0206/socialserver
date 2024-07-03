import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  console.log(req.headers.authorization.split(' ')[1])
  console.log(token)
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, "secret");
    console.log(data)
    req.user = data;
    return next();
  } catch {
    return res.sendStatus(403);
  }
  // const token = req.headers.authorization;
  // if(token){
  //   let jwt = token.split(' ')[1];
  //   jwt.verify(jwt,"secret",(err,data)=>{
  //     if(err){
  //       return res.status(400).send("Invalid Token!");
  //     }
  //     req.user = data;
  //     next()
  //   })
  // }else{
  //   return res.sendStatus(403);
  // }
};
