const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');
const XLSX = require('xlsx');

const app = express();
const port = 3001;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const hf = new HfInference('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');

// Hàm để lưu transcript vào file Excel
function saveToExcel(fileName, transcript) {
  const filePath = path.join(__dirname, 'transcripts.xlsx');
  let workbook;
  
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
  } else {
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['File Name', 'Transcript']]), 'Transcripts');
  }

  const sheet = workbook.Sheets['Transcripts'];
  const data = XLSX.utils.sheet_to_json(sheet);
  data.push({ 'File Name': fileName, 'Transcript': transcript });
  
  XLSX.utils.sheet_add_json(sheet, data, { skipHeader: true, origin: 'A2' });
  XLSX.writeFile(workbook, filePath);
}

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Không có file được tải lên');
  }

  const inputPath = req.file.path;
  const fileName = req.file.originalname;

  try {
    const audioBuffer = fs.readFileSync(inputPath);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo",
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: audioBuffer,
      }
    );
    const data = await response.json();
    const transcription = data.text;

    // Lưu transcript vào file Excel
    saveToExcel(fileName, transcription);

    res.json({ transcription: transcription });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).send('Đã xảy ra lỗi khi xử lý audio');
  } finally {
    // Xóa file tạm
    fs.unlinkSync(inputPath);
  }
});

app.listen(port, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});
