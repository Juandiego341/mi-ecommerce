import rateLimit from "express-rate-limit";


// Limite general de la applicacion es de 100 peticiones o si no podra reintentarlo en 15 minutos ( Por el momento )
export const generalLimiter = rateLimit ({
    windowMs : 15 * 60 * 1000,
    limit: 100,
    message:{ 
        code: 'TOO_MANY_REQUESTS',
        message: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
    }
})

//Limite de 10 peticiones por ip o si no se podra reintentar en 15 minutos (Por el momento)

export const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit:  10, 
    message:{
         code: 'TOO_MANY_REQUESTS',
        message: 'Demasiados intentos, intenta de nuevo en 15 minutos'
    }
})