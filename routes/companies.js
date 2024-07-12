const db = require("../db");
const slugify = require("../gitignore/node_modules/slugify/slugify");
const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router();


router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, 
            name FROM companies 
            ORDER BY name`);
        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

router.get("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name, description 
            FROM companies 
            WHERE code = $1`,
            [req.params.code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`No such company: ${req.params.code}`, 404);
        }
        return res.json({ company: results.rows[0] });
        
    } catch (err) {
        return next(err);
    }
    });

router.post("/", async function (req, res, next) {
    try{
        let code = slugify(req.body.name, { lower: true });
       const results = await db.query(
           `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3) 
           RETURNING code, name, description`,
           [code, req.body.name, req.body.description]
       );
         return res.status(201).json({ company: results.rows[0] }); 
    } catch(err){
        return next(err);   
    }
    });

router.put("/:code", async function (req, res, next) {
    try {
        let code = slugify(req.body.name, { lower: true });
        const results = await db.query(
            `UPDATE companies 
            SET name=$1, description=$2 
            WHERE code=$3 
            RETURNING code, name, description`,
            [req.body.name, req.body.description, code]
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

router.delete("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM companies 
            WHERE code=$1 
            RETURNING code`,
            [req.params.code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404);
        } else {
            return res.json({ status: "deleted" });
        }
    } catch (err) {
        return next(err);
    }
});



module.exports = router;