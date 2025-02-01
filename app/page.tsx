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

const HomePage: React.FC = () => {
  // State for input and error message
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

  const handleIncomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIncome(e.target.value);
  };

  const calculateTax = (e: FormEvent<HTMLFormElement>) => {
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
      // New calculation applies only for taxable income above ₹12,00,000.
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
    // Traditional Calculation
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
    } else if (taxableIncome <= 1000000) {
      const excess = taxableIncome - 700000;
      const taxExcess = excess * 0.10;
      const total = 20000 + taxExcess;
      setOldTax(total);
      setOldBreakdown([
        { description: "Up to ₹7,00,000", taxable: 700000, rate: 0, tax: 0 },
        {
          description: "Excess over ₹7,00,000 at 10%",
          taxable: excess,
          rate: 10,
          tax: taxExcess,
        },
        { description: "Fixed Component", taxable: 0, rate: 0, tax: 20000 },
      ]);
    } else if (taxableIncome <= 1200000) {
      const excess = taxableIncome - 1000000;
      const taxExcess = excess * 0.15;
      const total = 50000 + taxExcess;
      setOldTax(total);
      setOldBreakdown([
        { description: "Up to ₹7,00,000", taxable: 700000, rate: 0, tax: 0 },
        {
          description: "₹7,00,001 to ₹10,00,000 (Fixed)",
          taxable: 300000,
          rate: 10,
          tax: 20000 + 0.10 * 300000,
        },
        {
          description: "Excess over ₹10,00,000 at 15%",
          taxable: excess,
          rate: 15,
          tax: taxExcess,
        },
      ]);
    } else if (taxableIncome <= 1500000) {
      const excess = taxableIncome - 1200000;
      const taxExcess = excess * 0.20;
      const total = 80000 + taxExcess;
      setOldTax(total);
      setOldBreakdown([
        { description: "Up to ₹7,00,000", taxable: 700000, rate: 0, tax: 0 },
        {
          description: "₹7,00,001 to ₹10,00,000 (Fixed)",
          taxable: 300000,
          rate: 10,
          tax: 20000 + 0.10 * 300000,
        },
        {
          description: "₹10,00,001 to ₹12,00,000 (Fixed)",
          taxable: 200000,
          rate: 15,
          tax: 0.15 * 200000,
        },
        {
          description: "Excess over ₹12,00,000 at 20%",
          taxable: excess,
          rate: 20,
          tax: taxExcess,
        },
      ]);
    } else {
      const excess = taxableIncome - 1500000;
      const taxExcess = excess * 0.30;
      const total = 140000 + taxExcess;
      setOldTax(total);
      setOldBreakdown([
        { description: "Up to ₹7,00,000", taxable: 700000, rate: 0, tax: 0 },
        {
          description: "₹7,00,001 to ₹10,00,000 (Fixed)",
          taxable: 300000,
          rate: 10,
          tax: 20000 + 0.10 * 300000,
        },
        {
          description: "₹10,00,001 to ₹12,00,000 (Fixed)",
          taxable: 200000,
          rate: 15,
          tax: 0.15 * 200000,
        },
        {
          description: "₹12,00,001 to ₹15,00,000 (Fixed)",
          taxable: 300000,
          rate: 20,
          tax: 0.20 * 300000,
        },
        {
          description: "Excess over ₹15,00,000 at 30%",
          taxable: excess,
          rate: 30,
          tax: taxExcess,
        },
      ]);
    }
  };

  // Helper function to calculate final tax liability including 4% cess
  const calculateFinalTax = (tax: number | null) =>
    tax !== null ? tax * (1 + CESS_RATE) : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Compute final tax liabilities for both methods
  const finalNewTax = newTax !== null ? calculateFinalTax(newTax) : 0;
  const finalOldTax = oldTax !== null ? calculateFinalTax(oldTax) : 0;

  // Compute savings message
  let savingsMessage = "";
  if (newTax !== null && oldTax !== null) {
    if (finalNewTax < finalOldTax) {
      savingsMessage = `New Calculation saves you ₹${formatCurrency(finalOldTax - finalNewTax)} compared to Traditional Calculation.`;
    } else if (finalOldTax < finalNewTax) {
      savingsMessage = `Traditional Calculation saves you ₹${formatCurrency(finalNewTax - finalOldTax)} compared to New Calculation.`;
    } else {
      savingsMessage = "Both methods yield the same final tax liability.";
    }
  }

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
          Income Tax Calculator Comparison
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom color="textSecondary">
          (After Standard Deduction of ₹{STANDARD_DEDUCTION.toLocaleString("en-IN")})
        </Typography>
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
        {/* Savings Summary is now placed right after the taxable income details */}
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
            <Typography variant="subtitle1">{savingsMessage}</Typography>
          </Box>
        )}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* New Calculation */}
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
                New Calculation (Progressive)
              </Typography>
              {newTax !== null && (
                <>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                    Final Tax Liability: ₹{formatCurrency(finalNewTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Tax before Cess: ₹{formatCurrency(newTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Health &amp; Education Cess (4%): ₹{formatCurrency(newTax * CESS_RATE)}
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
          {/* Traditional Calculation */}
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
                Traditional Calculation
              </Typography>
              {oldTax !== null && (
                <>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                    Final Tax Liability: ₹{formatCurrency(finalOldTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Tax before Cess: ₹{formatCurrency(oldTax)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Health &amp; Education Cess (4%): ₹{formatCurrency(oldTax * CESS_RATE)}
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
      </Paper>
    </Container>
  );
};

export default HomePage;
