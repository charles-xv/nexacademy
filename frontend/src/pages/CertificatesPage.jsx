import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Award, Lock, Download } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonList } from "../components/Skeleton";
import { API_URL } from "../api";
import "./CertificatesPage.css";

function CertificatesPage({ user, logout }) {
  const [earned, setEarned] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(
          API_URL + "/get-certificates.php?student_id=" + user.id,
        );
        const data = await response.json();
        setEarned(Array.isArray(data.earned) ? data.earned : []);
        setInProgress(Array.isArray(data.in_progress) ? data.in_progress : []);
      } catch (err) {
        setEarned([]);
        setInProgress([]);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value.replace(" ", "T")).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Capitalises each word of whatever the user has as their name. The name
  // is theirs to set in Settings; this only fixes the casing for display.
  const certificateName = () => {
    const source = (user.name || "").trim() || "Student";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  // Opens a print window containing only this certificate, styled inline.
  // Everything flows top to bottom in normal document order, so no element
  // can overlap another regardless of the print margin setting.
  const handleDownload = (cert) => {
    const displayName = certificateName();
    const PURPLE = "#5B4FE8";

    // Scalloped badge edge, drawn as a 24-point star.
    let scallop = "";
    for (let i = 0; i < 48; i++) {
      const r = i % 2 === 0 ? 58 : 50;
      const a = (Math.PI * 2 * i) / 48 - Math.PI / 2;
      scallop +=
        (100 + r * Math.cos(a)).toFixed(1) +
        "," +
        (66 + r * Math.sin(a)).toFixed(1) +
        " ";
    }

    const year = new Date(
      (cert.issued_at || "").replace(" ", "T"),
    ).getFullYear();

    const win = window.open("", "_blank", "width=1000,height=720");
    if (!win) {
      alert("Please allow pop-ups for this site to download your certificate.");
      return;
    }

    win.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
        "<title>Certificate - " + cert.title + "</title><style>" +
        "@page{size:A4 landscape;margin:0;}" +
        "*{margin:0;padding:0;box-sizing:border-box;" +
        "-webkit-print-color-adjust:exact;print-color-adjust:exact;}" +
        "body{font-family:Calibri,Arial,sans-serif;background:#fff;}" +
        ".sheet{position:relative;width:297mm;min-height:209mm;background:#fff;" +
        "padding:64px 96px 48px;display:flex;flex-direction:column;" +
        "align-items:center;overflow:hidden;}" +
        ".swoosh{position:absolute;top:0;left:0;width:260px;height:100%;" +
        "z-index:0;}" +
        ".sheet > *:not(.swoosh){position:relative;z-index:1;}" +
        ".mark{font-size:11pt;font-weight:700;letter-spacing:.32em;" +
        "color:" + PURPLE + ";}" +
        ".head{font-family:'Times New Roman',Georgia,serif;font-size:36pt;" +
        "letter-spacing:.22em;color:#111;margin-top:20px;font-weight:400;}" +
        ".sub{display:flex;align-items:center;gap:16px;margin-top:8px;}" +
        ".sub span{font-size:10.5pt;letter-spacing:.3em;color:#555;}" +
        ".sub i{display:block;width:74px;height:1px;background:#999;}" +
        ".name{font-family:'Segoe Script','Brush Script MT',Georgia,serif;" +
        "font-size:32pt;color:#111;margin-top:24px;line-height:1.15;" +
        "white-space:nowrap;}" +
        ".nrule{width:50%;height:1px;background:#bbb;margin-top:10px;}" +
        ".body{font-size:11.5pt;color:#444;line-height:1.6;max-width:56%;" +
        "text-align:center;margin-top:20px;}" +
        ".course{font-family:'Times New Roman',Georgia,serif;font-size:17pt;" +
        "color:#111;margin-top:6px;text-align:center;max-width:66%;}" +
       ".seal{margin-top:auto;}" +
        ".foot{display:flex;gap:150px;margin-top:20px;margin-bottom:8px;}" +
        ".col{width:190px;text-align:center;}" +
        ".cval{font-family:'Times New Roman',Georgia,serif;font-size:11pt;" +
        "color:#222;padding-bottom:8px;}" +
        ".csig{font-family:'Segoe Script','Brush Script MT',Georgia,serif;" +
        "font-size:19pt;color:" + PURPLE + ";padding-bottom:2px;}" +
        ".cline{height:1px;background:#999;}" +
        ".clab{font-size:9pt;letter-spacing:.22em;color:#666;margin-top:9px;}" +
        ".id{font-family:Consolas,monospace;font-size:8pt;letter-spacing:.1em;" +
        "color:#aaa;margin-top:22px;}" +
        "</style></head><body>" +
        '<div class="sheet">' +

        /* flowing ribbon down the left edge */
   '<svg class="swoosh" viewBox="0 0 260 790" preserveAspectRatio="none" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0 C80 150 24 300 104 430 C168 535 52 660 0 790 Z" ' +
        'fill="' + PURPLE + '"/>' +
        '<path d="M0 40 C96 180 32 330 114 460 C182 555 62 690 0 790 Z" ' +
        'fill="#7A6FEC"/>' +
        '<path d="M0 120 C116 240 46 380 128 500 C192 585 74 700 0 790" ' +
        'fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.5"/>' +
        '<path d="M0 158 C126 274 62 408 142 524 C200 604 84 714 0 790" ' +
        'fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.4"/>' +
        '<path d="M0 196 C136 308 76 438 158 548 C210 624 94 728 0 790" ' +
        'fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.3"/>' +
        "</svg>" +

        '<div class="mark">NEXACADEMY</div>' +
        '<div class="head">CERTIFICATE</div>' +
        '<div class="sub"><i></i><span>OF COMPLETION</span><i></i></div>' +
        '<div class="name">' + displayName + "</div>" +
        '<div class="nrule"></div>' +
        '<div class="body">has successfully completed all requirements of the course</div>' +
        '<div class="course">' + cert.title + "</div>" +

        /* award seal, in normal flow */
        '<svg class="seal" viewBox="0 0 200 200" width="180" height="180" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M74 104 L58 176 L84 164 L96 186 L112 124 Z" fill="#8E1D17"/>' +
        '<path d="M126 104 L142 176 L116 164 L104 186 L88 124 Z" fill="#B3261E"/>' +
        '<polygon points="' + scallop + '" fill="#B3261E"/>' +
        '<circle cx="100" cy="66" r="45" fill="none" stroke="#fff" stroke-width="2"/>' +
        '<text x="100" y="54" text-anchor="middle" fill="#fff" ' +
        'font-family="Arial,Helvetica,sans-serif" font-size="12">&#9733;</text>' +
        '<text x="100" y="73" text-anchor="middle" fill="#fff" ' +
        'font-family="Arial,Helvetica,sans-serif" font-size="16" ' +
        'font-weight="700" letter-spacing="1.5">NEXACAD</text>' +
        '<text x="100" y="90" text-anchor="middle" fill="#fff" ' +
        'font-family="Arial,Helvetica,sans-serif" font-size="11" ' +
        'letter-spacing="1">' + year + "</text>" +
        "</svg>" +

        '<div class="foot">' +
        '<div class="col">' +
        '<div class="cval">' + formatDate(cert.issued_at) + "</div>" +
        '<div class="cline"></div><div class="clab">DATE</div>' +
        "</div>" +
        '<div class="col">' +
        '<div class="csig">NeXAcaDemY</div>' +
        '<div class="cline"></div><div class="clab">SIGNATURE</div>' +
        "</div>" +
        "</div>" +

        '<div class="id">Certificate ID: ' + cert.credential_id + "</div>" +
        "</div></body></html>",
    );
    win.document.close();

    setTimeout(function () {
      win.focus();
      win.print();
    }, 400);
  };

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="cert-header">
        <h1>Certificates</h1>
        <p>Complete a course to earn a certificate you can download and share.</p>
      </div>

      {loading ? (
        <SkeletonList count={2} />
      ) : earned.length === 0 ? (
        <div className="empty-state">
          <Award size={26} />
          <p>No certificates yet</p>
          <span>Finish a course to earn your first one</span>
        </div>
      ) : (
        <div className="cert-grid">
          {earned.map((cert) => (
            <div className="cert-card earned" key={cert.course_id}>
              <div className="cert-card-ribbon">
                <Award size={20} />
              </div>
              <p className="cert-card-title">{cert.title}</p>
              <span className="cert-card-meta">
                {cert.instructor_name} · Issued {formatDate(cert.issued_at)}
              </span>
              <span className="cert-card-id">ID: {cert.credential_id}</span>
              <button
                className="cert-download-btn"
                onClick={() => handleDownload(cert)}
              >
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="section-head">
        <h3>Available to earn</h3>
      </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : inProgress.length === 0 ? (
        <div className="empty-state">
          <Lock size={26} />
          <p>
            {earned.length > 0
              ? "You've finished everything you're enrolled in"
              : "You're not enrolled in anything yet"}
          </p>
          <span>Enrol in a course to start working toward a certificate</span>
          <Link to="/dashboard/browse" className="cert-browse-btn">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="cert-grid">
          {inProgress.map((cert) => (
            <Link
              to={"/dashboard/courses/" + cert.course_id}
              className="cert-card locked"
              key={cert.course_id}
            >
              <div className="cert-card-ribbon locked">
                <Lock size={18} />
              </div>
              <p className="cert-card-title">{cert.title}</p>
              <div className="cert-progress-bar">
                <div
                  className="cert-progress-fill"
                  style={{ width: cert.progress + "%" }}
                />
              </div>
              <span className="cert-card-meta">
                {cert.progress}% complete - finish to unlock
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default CertificatesPage;