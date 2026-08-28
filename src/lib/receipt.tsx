import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#ea580c",
    borderBottomStyle: "solid",
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  brandAccent: {
    color: "#ea580c",
  },
  brandAddress: {
    marginTop: 4,
    fontSize: 9,
    color: "#666666",
    lineHeight: 1.4,
  },
  receiptTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  receiptMeta: {
    marginTop: 4,
    fontSize: 9,
    color: "#666666",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    fontSize: 11,
    marginBottom: 3,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "solid",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    borderBottomStyle: "solid",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCellLabel: {
    flex: 1,
    color: "#555555",
  },
  tableCellValue: {
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff7ed",
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ea580c",
  },
  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    borderTopStyle: "solid",
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    lineHeight: 1.5,
  },
});

export function ReceiptDocument({
  receiptId,
  paidDate,
  studentName,
  studentEmail,
  courseTitle,
  batchMode,
  paymentMethod,
  gatewayReference,
  amountPaid,
  currency,
}: {
  receiptId: string;
  paidDate: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  batchMode: string;
  paymentMethod: string;
  gatewayReference: string;
  amountPaid: string;
  currency: string;
}) {
  return (
    <Document title={`Receipt — ${receiptId}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              Talent<Text style={styles.brandAccent}>Expert</Text>
            </Text>
            <Text style={styles.brandAddress}>
              Financial District, Hyderabad, Telangana, India{"\n"}hello@talentexpertedu.com
            </Text>
          </View>
          <View>
            <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
            <Text style={styles.receiptMeta}>Receipt No: {receiptId}</Text>
            <Text style={styles.receiptMeta}>Date: {paidDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Billed to</Text>
          <Text style={[styles.row, styles.bold]}>{studentName}</Text>
          <Text style={styles.row}>{studentEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment details</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Course</Text>
              <Text style={styles.tableCellValue}>{courseTitle}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Mode</Text>
              <Text style={styles.tableCellValue}>{batchMode}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Payment method</Text>
              <Text style={styles.tableCellValue}>{paymentMethod}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.tableCellLabel}>Gateway reference</Text>
              <Text style={styles.tableCellValue}>{gatewayReference}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount paid</Text>
            <Text style={styles.totalValue}>
              {currency} {amountPaid}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This is a computer-generated receipt and does not require a signature.{"\n"}
          Talent Expert — Career-focused live training, hands-on batches, and placement assistance.
        </Text>
      </Page>
    </Document>
  );
}
