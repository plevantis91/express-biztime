const db = require("../db");
const express = require("express");
const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, industry FROM industries`);
        return res.json({ industries: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

router.get("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, industry FROM industries WHERE code = $1`,
            [req.params.code]);
        return res.json({ industry: results.rows[0] });

    } catch (err) {
        return next(err);
    }
});

router.post("/", async function (req, res, next) {
    try {
        let code = req.body.code;
        const results = await db.query(
            `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
            [code, req.body.industry]
        );
        return res.status(201).json({ industry: results.rows[0] });
    } catch {
        return next(err);
    }
});

router.put("/:code", async function (req, res, next) {
    try {
        let code = req.body.code;
        const results = await db.query(
            `UPDATE industries SET industry=$1 WHERE code=$2 RETURNING code, industry`,
            [req.body.industry, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No such industry: ${code}`, 404);
        } else {
            return res.json({ industry: results.rows[0] });
        }
    } catch (err) {
        return next(err);
    }
});

router.delete("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM industries WHERE code = $1`,
            [req.params.code]);
        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
});
