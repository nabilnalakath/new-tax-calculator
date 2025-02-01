"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface BreakdownItem {
  description: string;
  taxable: number;
  rate: number;
  tax: number;
}

const STANDARD_DEDUCTION = 75000;
const CESS_RATE = 0.04;

// Helper: Calculate surcharge based on net taxable income and base tax
const calculateSurcharge = (netIncome: number, tax: number): number => {
  if (netIncome < 5000000) return 0;
  else if (netIncome <= 10000000) return tax * 0.10;
  else if (netIncome <= 20000000) return tax * 0.15;
  else if (netIncome <= 50000000) return tax * 0.25;
  else return tax * 0.25;
};

// Helper: Calculate final tax liability including surcharge and cess
const calculateFinalTax = (netIncome: number, tax: number): number => {
  const surcharge = calculateSurcharge(netIncome, tax);
  return (tax + surcharge) * (1 + CESS_RATE);
};

const HomePage: React.FC = () => {
  // States for input and error message
  const [income, setIncome] = useState<string>("");
  const [error, setError] = useState<string>("");

  // To store the net income after standard deduction
  const [netIncome, setNetIncome] = useState<number | null>(null);

  // State for the new calculation (progressive method)
  const [newTax, setNewTax] = useState<number | null>(null);
  const [newBreakdown, setNewBreakdown] = useState<BreakdownItem[]>([]);

  // State for the traditional calculation
  const [oldTax, setOldTax] = useState<number | null>(null);
  const [oldBreakdown, setOldBreakdown] = useState<BreakdownItem[]>([]);

  const [calculated, setCalculated] = useState<boolean>(false);

  const handleIncomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIncome(e.target.value);
  };

  const calculateTax = (e: FormEvent<HTMLFormElement>) => {
    setCalculated(true);
    e.preventDefault();
    setError("");
    setNewTax(null);
    setNewBreakdown([]);
    setOldTax(null);
    setOldBreakdown([]);
    setNetIncome(null);

    const totalIncome = parseFloat(income);
    if (isNaN(totalIncome) || totalIncome < 0) {
      setError("Please enter a valid income amount.");
      return;
    }

    // Apply standard deduction
    const taxableIncome = totalIncome - STANDARD_DEDUCTION;
    setNetIncome(taxableIncome);

    // -----------------------------
    // New Calculation (Progressive)
    // -----------------------------
    if (taxableIncome < 1200000) {
      setNewTax(0);
      setNewBreakdown([
        {
          description: "Taxable income below ₹12,00,000 – No tax",
          taxable: taxableIncome,
          rate: 0,
          tax: 0,
        },
      ]);
    } else {
      let newTotalTax = 0;
      const newItems: BreakdownItem[] = [];
      let remaining = taxableIncome;

      if (remaining > 2400000) {
        const slab = remaining - 2400000;
        const slabTax = slab * 0.30;
        newItems.push({
          description: "Above ₹24,00,000",
          taxable: slab,
          rate: 30,
          tax: slabTax,
        });
        newTotalTax += slabTax;
        remaining = 2400000;
      }
      if (remaining > 2000000) {
        const slab = remaining - 2000000;
        const slabTax = slab * 0.25;
        newItems.push({
          description: "₹20,00,001 to ₹24,00,000",
          taxable: slab,
          rate: 25,
          tax: slabTax,
        });
        newTotalTax += slabTax;
        remaining = 2000000;
      }
      if (remaining > 1600000) {
        const slab = remaining - 1600000;
        const slabTax = slab * 0.20;
        newItems.push({
          description: "₹16,00,001 to ₹20,00,000",
          taxable: slab,
          rate: 20,
          tax: slabTax,
        });
        newTotalTax += slabTax;
        remaining = 1600000;
      }
      if (remaining > 1200000) {
        const slab = remaining - 1200000;
        const slabTax = slab * 0.15;
        newItems.push({
          description: "₹12,00,001 to ₹16,00,000",
          taxable: slab,
          rate: 15,
          tax: slabTax,
        });
        newTotalTax += slabTax;
        remaining = 1200000;
      }
      if (remaining > 800000) {
        const slab = remaining - 800000;
        const slabTax = slab * 0.10;
        newItems.push({
          description: "₹8,00,001 to ₹12,00,000",
          taxable: slab,
          rate: 10,
          tax: slabTax,
        });
        newTotalTax += slabTax;
        remaining = 800000;
      }
      if (remaining > 400000) {
        const slab = remaining - 400000;
        const slabTax = slab * 0.05;
        newItems.push({
          description: "₹4,00,001 to ₹8,00,000",
          taxable: slab,
          rate: 5,
          tax: slabTax,
        });
        newTotalTax += slabTax;
        remaining = 400000;
      }
      newItems.push({
        description: "₹0 to ₹4,00,000",
        taxable: 400000,
        rate: 0,
        tax: 0,
      });

      setNewTax(newTotalTax);
      setNewBreakdown(newItems.reverse());
    }

    // -------------------------------
    // Traditional Calculation (Slab-wise)
    // -------------------------------
    if (taxableIncome < 700000) {
      setOldTax(0);
      setOldBreakdown([
        {
          description: "Taxable income below ₹7,00,000 – No tax",
          taxable: taxableIncome,
          rate: 0,
          tax: 0,
        },
      ]);
    } else {
      const breakdownItems: BreakdownItem[] = [];
      // Slab 1: Up to ₹3,00,000: No tax
      breakdownItems.push({
        description: "Up to ₹3,00,000: No tax",
        taxable: Math.min(taxableIncome, 300000),
        rate: 0,
        tax: 0,
      });
      // Slab 2: ₹3,00,001 to ₹7,00,000: 5%
      const slab2 = Math.max(Math.min(taxableIncome, 700000) - 300000, 0);
      breakdownItems.push({
        description: "₹3,00,001 to ₹7,00,000: 5%",
        taxable: slab2,
        rate: 5,
        tax: slab2 * 0.05,
      });
      // Slab 3: ₹7,00,001 to ₹10,00,000: 10%
      const slab3 = Math.max(Math.min(taxableIncome, 1000000) - 700000, 0);
      breakdownItems.push({
        description: "₹7,00,001 to ₹10,00,000: 10%",
        taxable: slab3,
        rate: 10,
        tax: slab3 * 0.10,
      });
      // Slab 4: ₹10,00,001 to ₹12,00,000: 15%
      const slab4 = Math.max(Math.min(taxableIncome, 1200000) - 1000000, 0);
      breakdownItems.push({
        description: "₹10,00,001 to ₹12,00,000: 15%",
        taxable: slab4,
        rate: 15,
        tax: slab4 * 0.15,
      });
      // Slab 5: ₹12,00,001 to ₹15,00,000: 20%
      const slab5 = Math.max(Math.min(taxableIncome, 1500000) - 1200000, 0);
      breakdownItems.push({
        description: "₹12,00,001 to ₹15,00,000: 20%",
        taxable: slab5,
        rate: 20,
        tax: slab5 * 0.20,
      });
      // Slab 6: Above ₹15,00,000: 30%
      const slab6 = Math.max(taxableIncome - 1500000, 0);
      breakdownItems.push({
        description: "Above ₹15,00,000: 30%",
        taxable: slab6,
        rate: 30,
        tax: slab6 * 0.30,
      });

      const totalTax = breakdownItems.reduce((sum, item) => sum + item.tax, 0);
      setOldTax(totalTax);
      setOldBreakdown(breakdownItems);
    }
  };

  // Helper to format currency
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Compute final tax liabilities including surcharge and cess for both methods
  const finalNewTax =
    newTax !== null && netIncome !== null ? calculateFinalTax(netIncome, newTax) : 0;
  const finalOldTax =
    oldTax !== null && netIncome !== null ? calculateFinalTax(netIncome, oldTax) : 0;

  // Compute individual surcharge amounts
  const newSurcharge =
    netIncome !== null && newTax !== null ? calculateSurcharge(netIncome, newTax) : 0;
  const oldSurcharge =
    netIncome !== null && oldTax !== null ? calculateSurcharge(netIncome, oldTax) : 0;

  // Build savings message as a JSX element with the savings amount highlighted
  const savingsJSX = (() => {
    if (newTax !== null && oldTax !== null) {
      if (finalNewTax < finalOldTax) {
        return (
          <>
            Latest New Tax Regime (FY 2025-2026) will save you{" "}
            <span style={{ fontWeight: "bold", color: "#d32f2f" }}>
              ₹{formatCurrency(finalOldTax - finalNewTax)}
            </span>{" "}
            compared to the Existing New Tax Regime.
          </>
        );
      } else if (finalOldTax < finalNewTax) {
        return (
          <>
            Existing New Tax Regime (FY 2024-2025) will save you{" "}
            <span style={{ fontWeight: "bold", color: "#d32f2f" }}>
              ₹{formatCurrency(finalNewTax - finalOldTax)}
            </span>{" "}
            compared to the Latest New Tax Regime.
          </>
        );
      } else {
        return <>Both methods yield the same final tax liability.</>;
      }
    }
    return null;
  })();

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 2,
        background:
          "linear-gradient(135deg, rgba(245,245,245,1) 0%, rgba(230,230,230,1) 100%)",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          m: { xs: 1, md: 4 },
          borderRadius: 2,
          transition: "transform 0.3s",
          "&:hover": { transform: "scale(1.01)" },
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Tax Calculator as Per Feb 1, 2025 Budget
        </Typography>
        {/* Disclaimer Card - now centered */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Paper
            elevation={1}
            sx={{
              p: 1,
              display: "inline-block",
              backgroundColor: "#ffebee",
              border: "1px solid #ffcdd2",
              animation: "glow 2s infinite",
            }}
          >
            <Typography variant="body2" align="center" color="textSecondary">
              This calculator is for quick reference only. Please refer to the official income tax website for final figures.
            </Typography>
          </Paper>
        </Box>
        <Box
          component="form"
          onSubmit={calculateTax}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            my: 3,
          }}
        >
          <TextField
            label="Total Annual Income (₹)"
            variant="outlined"
            type="number"
            value={income}
            onChange={handleIncomeChange}
            fullWidth
            sx={{ maxWidth: 500 }}
          />
          <Button variant="contained" color="primary" type="submit" sx={{ px: 4 }}>
            Calculate Tax
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ maxWidth: 500, mx: "auto" }}>
            {error}
          </Alert>
        )}
        {netIncome !== null && (
          <Box sx={{ my: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" color="textSecondary">
              Standard Deduction: ₹{STANDARD_DEDUCTION.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Taxable Income after Deduction: ₹{formatCurrency(netIncome)}
            </Typography>
          </Box>
        )}
        {/* Savings Summary */}
        {netIncome !== null && newTax !== null && oldTax !== null && (
          <Box
            sx={{
              my: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#e8f5e9",
              border: "1px solid #c8e6c9",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
              Savings Summary
            </Typography>
            <Typography variant="subtitle1">{savingsJSX}</Typography>
          </Box>
        )}
        {calculated && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Latest New Tax Regime Card with Pulse Animation */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={4}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fafafa",
                border: "2px solid #2e7d32",
                transition: "box-shadow 0.3s",
                animation: "pulse 2s infinite",
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Latest New Tax Regime (FY 2025-2026)
              </Typography>
              {newTax !== null && netIncome !== null && (
                <>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                    Final Tax Liability: ₹{formatCurrency(finalNewTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Tax before Surcharge &amp; Cess: ₹{formatCurrency(newTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Surcharge (@ {netIncome <= 10000000 ? "10%" : netIncome <= 20000000 ? "15%" : "25%"}):{" "}
                    ₹{formatCurrency(newSurcharge)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Health &amp; Education Cess (4%): ₹
                    {formatCurrency((newTax + newSurcharge) * CESS_RATE)}
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Taxable (₹)</TableCell>
                          <TableCell align="right">Rate (%)</TableCell>
                          <TableCell align="right">Tax (₹)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {newBreakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{formatCurrency(item.taxable)}</TableCell>
                            <TableCell align="right">{item.rate}</TableCell>
                            <TableCell align="right">{formatCurrency(item.tax)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              {newTax === null && (
                <Typography variant="body2" color="textSecondary">
                  (New calculation applies only for taxable income above ₹12,00,000.)
                </Typography>
              )}
            </Paper>
          </Grid>
          {/* Traditional Calculation Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fafafa",
                transition: "box-shadow 0.3s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Existing New Tax Regime (FY 2024-2025)
              </Typography>
              {oldTax !== null && netIncome !== null && (
                <>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                    Final Tax Liability: ₹{formatCurrency(finalOldTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Tax before Surcharge &amp; Cess: ₹{formatCurrency(oldTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Surcharge (@ {netIncome <= 10000000 ? "10%" : netIncome <= 20000000 ? "15%" : "25%"}):{" "}
                    ₹{formatCurrency(oldSurcharge)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Health &amp; Education Cess (4%): ₹
                    {formatCurrency((oldTax + oldSurcharge) * CESS_RATE)}
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Taxable (₹)</TableCell>
                          <TableCell align="right">Rate (%)</TableCell>
                          <TableCell align="right">Tax (₹)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {oldBreakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{formatCurrency(item.taxable)}</TableCell>
                            <TableCell align="right">{item.rate}</TableCell>
                            <TableCell align="right">{formatCurrency(item.tax)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              {oldTax === null && (
                <Typography variant="body2" color="textSecondary">
                  (No tax applicable for taxable income below ₹7,00,000.)
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        )}
      </Paper>
      {/* Global Keyframes for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
          }
        }
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px #ff8a80;
          }
          50% {
            box-shadow: 0 0 20px #ff8a80;
          }
          100% {
            box-shadow: 0 0 5px #ff8a80;
          }
        }
      `}</style>
    </Container>
  );
};

export default HomePage;
