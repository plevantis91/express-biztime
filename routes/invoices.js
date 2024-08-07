const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: results.rows });
    }
    catch (err) {
        return next(err);
    }
}
);

router.get("/:id", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE id = $1`,
            [req.params.id]);
        return res.json({ invoice: results.rows[0] });

    } catch (err) {
        return next(err);
    }
});

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [req.body.comp_code, req.body.amt]
        );
        return res.status(201).json({ invoice: results.rows[0] });
    } catch {
        return next(err);
    }
}
);

router.put("/:id", async function (req, res, next) {

    try {
        let paid_date = null;
        if (req.body.paid && !req.body.paid_date) {
            paid_date = new Date();
        } else if (!req.body.paid) {
            paid_date = null;
        }   else { 
            paid_date = req.body.paid_date;
        }

        const results = await db.query(
            `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [req.body.amt, req.body.paid, paid_date, req.params.id]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        } else {
            return res.json({ invoice: results.rows[0] });
        }
    } catch (err) {
        return next(err);
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM invoices WHERE id=$1 RETURNING id`,
            [req.params.id]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        } else {
            return res.json({ status: "deleted" });
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;