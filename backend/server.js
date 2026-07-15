import express from 'express';
import cors from 'cors';
import invoiceRouter from './routes/invoices.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/invoices', invoiceRouter);

app.listen(PORT, () => {
  console.log(`Express Multi-Tenant Server running on port ${PORT}`);
});


