import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  border: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#ea580c",
    borderStyle: "solid",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 14,
    letterSpacing: 3,
    color: "#ea580c",
    marginBottom: 24,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    color: "#111111",
  },
  subtitle: {
    fontSize: 13,
    color: "#555555",
    marginBottom: 28,
  },
  studentName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    color: "#111111",
  },
  courseText: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: "center",
    color: "#333333",
    lineHeight: 1.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    borderTopStyle: "solid",
  },
  footerItem: {
    fontSize: 10,
    color: "#666666",
  },
});

export function CertificateDocument({
  studentName,
  courseTitle,
  completedDate,
  certificateId,
  trainerName,
}: {
  studentName: string;
  courseTitle: string;
  completedDate: string;
  certificateId: string;
  trainerName: string | null;
}) {
  return (
    <Document title={`Certificate — ${studentName}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.brand}>Talent Expert</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.subtitle}>This certifies that</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.courseText}>has successfully completed the course{"\n"}{courseTitle}</Text>
          <View style={styles.footer}>
            <Text style={styles.footerItem}>Date: {completedDate}</Text>
            {trainerName ? <Text style={styles.footerItem}>Trainer: {trainerName}</Text> : null}
            <Text style={styles.footerItem}>Certificate ID: {certificateId}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
