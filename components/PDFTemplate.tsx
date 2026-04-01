import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { IDocument } from '@/models/Document';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  company: {
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
  },
  totals: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: 200,
  },
});

interface PDFTemplateProps {
  document: IDocument;
  company: any;
  billTo: any;
}

export function PDFTemplate({ document, company, billTo }: PDFTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{document.type} - {document.number}</Text>
          <Text>Date: {new Date(document.date).toLocaleDateString()}</Text>
        </View>

        <View style={styles.company}>
          <Text>{company.name}</Text>
          <Text>{company.address}</Text>
          <Text>{company.city}, {company.country}</Text>
          <Text>TRN: {company.trn}</Text>
        </View>

        <View>
          <Text>Bill To:</Text>
          <Text>{billTo?.name}</Text>
          <Text>{billTo?.address}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Qty</Text>
            <Text style={styles.tableCell}>Price</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {document.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{line.description}</Text>
              <Text style={styles.tableCell}>{line.quantity}</Text>
              <Text style={styles.tableCell}>{line.price}</Text>
              <Text style={styles.tableCell}>{line.total}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <Text>Subtotal: {document.subtotal}</Text>
          <Text>VAT: {document.vatAmount}</Text>
          <Text>Total: {document.grandTotal}</Text>
          <Text>{document.amountInWords}</Text>
        </View>
      </Page>
    </Document>
  );
}