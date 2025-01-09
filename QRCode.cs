using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Aspose.BarCode.BarCodeRecognition;
using System;
using System.IO;
using System.Threading.Tasks;

namespace YourNamespace.Controllers
{
    [Route("api/qrcode")]
    [ApiController]
    public class QrCodeController : ControllerBase
    {
        [HttpPost("decode")]
        public async Task<IActionResult> DecodeQrCode(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            try
            {
                // ✅ Convert file to MemoryStream
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                // ✅ Decode the QR code using Aspose
                using BarCodeReader reader = new BarCodeReader(stream, DecodeType.QR);
                string qrData = null;

                while (reader.Read())
                {
                    qrData = reader.GetCodeText();
                    break; // Only read the first QR code
                }

                if (string.IsNullOrEmpty(qrData))
                {
                    return BadRequest(new { message = "No QR code found in the image" });
                }

                return Ok(new { referenceId = qrData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error processing QR code", error = ex.Message });
            }
        }
    }
}
