const db = require("../db");
const express = require("express");
const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name FROM companies`);
        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

router.get("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name, description FROM companies WHERE code = $1`,
            [req.params.code]);
            return res.json({ company: results.rows[0] });
        
    } catch (err) {
        return next(err);
    }
    });

router.post("/", async function (req, res, next) {
    try{
       const results = await db.query(
           `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
           [req.body.code, req.body.name, req.body.description]
       );
         return res.status(201).json({ company: results.rows[0] }); 
    } catch{
        return next(err);   
    }
    });

router.put("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
            [req.body.name, req.body.description, req.params.code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404);
        } else {
            return res.json({ company: results.rows[0] });
        }
    } catch (err) {
        return next(err);
    }
});



module.exports = router;