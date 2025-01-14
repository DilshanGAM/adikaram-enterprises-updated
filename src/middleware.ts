
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { Code } from 'lucide-react';


export async function middleware( req : NextRequest ) {
    try{
      //check if there is a token in the request header
      const token = req.headers.get("Authorization");

      if(token){
          const user = await jose.jwtVerify(token.replace("Bearer ",""),new TextEncoder().encode(process.env.JOSE_SECRET));
          
          if(user){
            req.headers.set("user",JSON.stringify(user.payload));
          }else{
            return NextResponse.json({message: "User not found",code : 2626 , description : "Your login session expired or you have been trying to use forged login token."}, {status: 404});
          }
      }
      //add all data of the request and send it to the next middleware
    }catch(e){
        console.log(e);
    }

    return NextResponse.next({
        request: req
    });
}

// Apply the middleware to all API routes
export const config = {
    matcher: ['/api/:path*']
};