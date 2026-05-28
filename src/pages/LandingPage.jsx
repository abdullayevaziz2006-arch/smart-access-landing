import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Target, 
  Smartphone, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  QrCode, 
  Phone, 
  Mail, 
  MapPin,
  X,
  PlayCircle,
  Download,
  Laptop,
  Server,
  Cpu,
  Layers,
  Settings,
  Tv,
  ExternalLink
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import '../global.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('agent'); // For download guide tabs

  // SaaS Auth States
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'google-password'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleFullName, setGoogleFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CENTRAL_SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : 'https://smart-access.onrender.com';

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${CENTRAL_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kirishda xatolik yuz berdi');
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setAuthModalOpen(false);
      setPhone('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${CENTRAL_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, fullName, phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      
      // Auto Login
      const loginRes = await fetch(`${CENTRAL_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Kirishda xatolik yuz berdi');

      localStorage.setItem('user', JSON.stringify(loginData));
      setUser(loginData);
      setAuthModalOpen(false);
      setOrgName('');
      setFullName('');
      setPhone('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (email, name, pass = '') => {
    setError('');
    setLoading(true);
    try {
      const payload = { email, fullName: name };
      if (pass) {
        payload.password = pass;
      }
      const res = await fetch(`${CENTRAL_SERVER_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.status === 202) {
        setGoogleEmail(email);
        setGoogleFullName(name);
        setAuthMode('google-password');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google orqali kirishda xatolik');
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setAuthModalOpen(false);
      setGoogleEmail('');
      setGoogleFullName('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) return setError("Parol kiritilishi shart");
    handleGoogleLogin(googleEmail, googleFullName, password);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "699051488236-2jpdbvgv6jf3m03jiup01uj7c72c9kmq.apps.googleusercontent.com",
          callback: (response) => {
            const decoded = parseJwt(response.credential);
            if (decoded && decoded.email) {
              handleGoogleLogin(decoded.email, decoded.name || decoded.given_name);
            }
          }
        });
        
        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: "outline", size: "large", width: 280 }
          );
        }
      }
    };

    if (authModalOpen) {
      setTimeout(initGoogle, 100);
    }
  }, [authModalOpen, authMode]);

  // ANPR Scanner Simulator State
  const [simStep, setSimStep] = useState(0); // 0: Scanning, 1: Recognized, 2: Access Granted / Payment Due
  const [simPlate, setSimPlate] = useState('01A777AA');
  const [simLog, setSimLog] = useState([
    { id: 1, plate: '01A111AA', status: 'WHITELIST', action: 'OPENED', time: '20:30:15' },
    { id: 2, plate: '10B222BB', status: 'PAID', action: 'OPENED', time: '20:32:44' },
    { id: 3, plate: '01X700XX', status: 'UNPAID', action: 'WAITING', time: '20:34:02' }
  ]);
  const [simType, setSimType] = useState('WHITELIST'); // WHITELIST, PAID, UNPAID

  useEffect(() => {
    const plates = [
      { num: '01A777AA', type: 'WHITELIST' },
      { num: '10B999BB', type: 'UNPAID' },
      { num: '30Z555ZZ', type: 'WHITELIST' },
      { num: '01A123AA', type: 'PAID' }
    ];
    let idx = 0;

    const interval = setInterval(() => {
      setSimStep(0);
      idx = (idx + 1) % plates.length;
      const current = plates[idx];
      setSimPlate(current.num);
      setSimType(current.type);

      setTimeout(() => {
        setSimStep(1);
      }, 1200);

      setTimeout(() => {
        setSimStep(2);
        setSimLog(prev => [
          {
            id: Date.now(),
            plate: current.num,
            status: current.type,
            action: current.type === 'UNPAID' ? 'WAITING' : 'OPENED',
            time: new Date().toTimeString().split(' ')[0]
          },
          ...prev.slice(0, 2)
        ]);
      }, 2500);

    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="portfolio-wrapper relative">
      {/* Background neon elements */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-glow"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none animate-glow" style={{ animationDelay: '-4s' }}></div>
      <div className="grid-overlay"></div>

      {/* HEADER */}
      <header style={{ 
        borderBottom: '1px solid var(--border)', 
        padding: '1rem 8%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: 'var(--glass)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="var(--primary)" size={32} />
          <span className="outfit" style={{ fontSize: '1.6rem', fontWeight: 800 }}>SmartAccess</span>
        </div>
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#about" className="nav-link">Biz haqimizda</a>
          <a href="#programs" className="nav-link">Dasturlarimiz</a>
          <a href="#download" className="nav-link">Yuklab Olish</a>
          <a href="#contact" className="nav-link">Bog'lanish</a>
          <ThemeToggle />
          {user ? (
            <button 
              onClick={handleLogout} 
              className="btn-secondary" 
              style={{ fontSize: '0.9rem', color: '#f87171' }}
            >
              {user.fullName.split(' ')[0]} (Chiqish)
            </button>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setError(''); setAuthModalOpen(true); }} 
              className="btn-primary" 
              style={{ fontSize: '0.9rem' }}
            >
              Tizimga Kirish
            </button>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="container section-padding animate-fade-in relative z-10" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '64px',
        paddingTop: '120px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1.2', minWidth: '320px' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-sky-400 mb-6 uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]"></span>
            Ilg'or SKUD va ANPR Tizimi
          </div>
          <h1 className="outfit animate-fade-in" style={{ fontSize: '4.2rem', lineHeight: 1.1, marginBottom: '24px', fontWeight: 900 }}>
            SmartAccess & <span style={{ color: 'var(--primary)', textShadow: '0 0 30px rgba(14,165,233,0.3)' }}>SmartPark</span> <br /> Kelajak IT Yechimlari
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>
            Bizning kompaniyamiz biznes jarayonlarini avtomatlashtirish, kirish-chiqish nazorati (SKUD), sun'iy intellekt asosida mashina raqamlarini tanish va aqlli parkovkalarni tashkil qilish bo'yicha yuqori sifatli yechimlar taqdim etadi.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#contact" className="btn-primary outfit">Hamkorlikni Boshlash</a>
            <a href="#programs" className="outfit" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              textDecoration: 'none', 
              color: 'var(--primary)', 
              fontWeight: 700 
            }}>Dasturlar bilan tanishish <ArrowRight size={18} /></a>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '320px' }} className="animate-float">
          {/* Hologram Box */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '32px',
            background: 'rgba(8, 12, 22, 0.65)',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.1)',
            backdropFilter: 'blur(20px)',
            maxWidth: '420px',
            margin: '0 auto',
            borderBottom: '3px solid rgba(14, 165, 233, 0.3)'
          }}>
            
            {/* Scan Screen */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}>
              {/* Grid pattern overlay */}
              <div className="grid-overlay" style={{ opacity: 0.15 }}></div>
              
              {/* Scan Line */}
              {simStep === 0 && <div className="scan-line"></div>}

              {/* Simulated Camera Feed Info */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 20
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 8px #ef4444'
                }} className="animate-pulse"></span>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>CAM_01_ANPR</span>
              </div>

              {/* Status text */}
              <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {simStep === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className="animate-pulse" style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      color: '#38bdf8',
                      textTransform: 'uppercase'
                    }}>Skanerlanmoqda...</div>
                    <div style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      color: '#64748b'
                    }}>Avtomobil aniqlanmoqda</div>
                  </div>
                )}

                {simStep >= 1 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    animation: 'fadeIn 0.5s ease-out forwards'
                  }}>
                    {/* License Plate Display (Real Uz Style) */}
                    <div style={{
                      border: '3px solid #0f172a',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontWeight: '800',
                      padding: '6px 20px',
                      fontSize: '24px',
                      letterSpacing: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        borderRight: '1px solid #0f172a',
                        paddingRight: '6px',
                        marginRight: '2px',
                        color: '#2563eb',
                        fontWeight: '900',
                        lineHeight: '1'
                      }}>
                        <span>UZ</span>
                      </div>
                      <span>{simPlate}</span>
                    </div>
                    
                    {simStep === 1 && (
                      <div className="animate-pulse" style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#fbbf24',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>Baza tekshirilmoqda...</div>
                    )}

                    {simStep === 2 && (
                      <div style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
                        {simType === 'WHITELIST' && (
                          <span style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#4ade80',
                            borderRadius: '50px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            letterSpacing: '1px'
                          }}>
                            🟢 OQ RO'YXAT - OCHILDI
                          </span>
                        )}
                        {simType === 'PAID' && (
                          <span style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            borderRadius: '50px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            letterSpacing: '1px'
                          }}>
                            🟢 TO'LANDI - OCHILDI
                          </span>
                        )}
                        {simType === 'UNPAID' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span className="animate-bounce" style={{
                              padding: '6px 12px',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              borderRadius: '50px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              letterSpacing: '1px'
                            }}>
                              🔴 TO'LOV KUTILMOQDA (10K UZS)
                            </span>
                            <div style={{
                              fontSize: '10px',
                              color: '#64748b'
                            }}>Kassir to'lovini kutyapti</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Feed Event Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#64748b',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: '8px'
              }}>
                <span>Real vaqt hodisalari</span>
                <span style={{ fontSize: '10px', color: '#0ea5e9', fontFamily: 'monospace' }}>LIVE FEED</span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '120px',
                overflow: 'hidden'
              }}>
                {simLog.map((log) => (
                  <div key={log.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748b' }}>{log.time}</span>
                      <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{log.plate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '50px',
                        backgroundColor: log.status === 'WHITELIST' ? 'rgba(56, 189, 248, 0.1)' : log.status === 'PAID' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        color: log.status === 'WHITELIST' ? '#38bdf8' : log.status === 'PAID' ? '#34d399' : '#f87171'
                      }}>
                        {log.status}
                      </span>
                      <span style={{
                        fontWeight: 'bold',
                        color: log.action === 'OPENED' ? '#34d399' : '#fbbf24'
                      }}>
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" style={{ backgroundColor: 'var(--bg-sub)' }} className="section-padding relative z-10">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="outfit" style={{ fontSize: '2.8rem', fontWeight: 800 }}>Kompaniya Haqida</h2>
            <div style={{ width: '80px', height: '4px', background: 'var(--primary)', margin: '16px auto', borderRadius: '2px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px' }}>
            <div className="card">
              <h3 className="outfit" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Bizning Missiyamiz</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Biz — innovatsion apparat va dasturiy yechimlarni uyg'unlashtirib, mijozlarimizga xavfsizlik va boshqaruvda maksimal qulaylik taqdim etuvchi jamoamiz. SmartAccess (turniket/QR tizimi) va SmartPark (shlagbaum/ANPR tizimi) kabi mahsulotlarimiz orqali har bir istirohat bog'i, biznes markazi yoki avtoturargohni zamonaviy raqamli boshqaruvga o'tkazamiz.
              </p>
            </div>
            <div className="card">
              <h3 className="outfit" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Nega aynan biz?</h3>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)', padding: 0 }}>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 color="var(--primary)" size={18} /> <strong>Hikvision va Dahua integratsiyasi:</strong> Uskunalar bilan to'g'ridan-to'g'ri integratsiya.
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 color="var(--primary)" size={18} /> <strong>Tezkor Tunnel Tizimi:</strong> Statik IP talab qilmasdan xavfsiz ishlash.
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 color="var(--primary)" size={18} /> <strong>Telegram Xabarnomalar:</strong> Suratlar va hisobotlar zudlik bilan guruhga yuboriladi.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS / SOFTWARE SECTION */}
      <section id="programs" className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="outfit" style={{ fontSize: '2.8rem', fontWeight: 800 }}>Bizning Dasturlarimiz</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Loyiha va biznesingiz uchun mukammal nazorat va avtomatlashtirish tizimlari</p>
          </div>
          
          <div className="programs-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '32px' 
          }}>
            {/* SMARTACCESS QR */}
            <div className="program-card" onClick={() => setActiveProduct('qr')} style={{ cursor: 'pointer', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'all 0.3s ease' }}>
              <div className="p-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '20px', borderRadius: '50%', width: 'fit-content', marginBottom: '20px' }}><QrCode size={32} /></div>
              <h3 className="outfit" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>SmartAccess QR</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Bog'lar va dam olish maskanlari uchun turniketlar, QR-kodli chiptalar va kassir/admin nazorat tizimi.</p>
              <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>Batafsil ma'lumot <ArrowRight size={16} /></span>
            </div>

            {/* SMARTPARK SHLAGBAUM */}
            <div className="program-card" onClick={() => setActiveProduct('parking')} style={{ cursor: 'pointer', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'all 0.3s ease' }}>
              <div className="p-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '20px', borderRadius: '50%', width: 'fit-content', marginBottom: '20px' }}><Settings size={32} /></div>
              <h3 className="outfit" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>SmartPark Shlagbaum</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Avtomatlashtirilgan avtoturargoh, ANPR (raqam tanish) kamerasi integratsiyasi va telegram-bot orqali hisobotlar.</p>
              <span style={{ color: '#0ea5e9', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>Batafsil ma'lumot <ArrowRight size={16} /></span>
            </div>

            {/* SMARTSTAFF SKUD */}
            <div className="program-card" onClick={() => setActiveProduct('skud')} style={{ cursor: 'pointer', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-card)', opacity: 0.8 }}>
              <div className="p-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '20px', borderRadius: '50%', width: 'fit-content', marginBottom: '20px' }}><Users size={32} /></div>
              <h3 className="outfit" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>SmartStaff SKUD</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>FaceID kameralar orqali xodimlar davomati, kelib-ketish vaqti va ish soati hisoboti.</p>
              <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>Tez kunda...</span>
            </div>

            {/* FINANCE ADMIN */}
            <div className="program-card" onClick={() => setActiveProduct('finance')} style={{ cursor: 'pointer', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-card)', opacity: 0.8 }}>
              <div className="p-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '20px', borderRadius: '50%', width: 'fit-content', marginBottom: '20px' }}><BarChart3 size={32} /></div>
              <h3 className="outfit" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Finance Admin</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Barcha kassa tizimlaridan keladigan tushumlar, xarajatlar va daromadlarni tahlil qilish paneli.</p>
              <span style={{ color: '#f97316', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>Tez kunda...</span>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD CENTER SECTION (Hikvision Uslubida) */}
      <section id="download" style={{ backgroundColor: 'var(--bg-sub)', padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="outfit" style={{ fontSize: '2.8rem', fontWeight: 800 }}>Yuklab Olish Markazi</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Tizim ishlashi uchun lokal kompyuterga o'rnatiladigan kerakli agent va qo'shimcha dasturlar</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
            {/* Dasturlar Ro'yxati */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Card 1: SmartPark Agent */}
              <div className="card" style={{ padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '14px', borderRadius: '12px' }}><Server size={28} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 className="outfit" style={{ fontSize: '1.3rem', margin: 0 }}>SmartPark Shlagbaum Agent (v1.0.2)</h3>
                    <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', fontWeight: 700 }}>Tavsiya etiladi</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 16px 0' }}>
                    Hikvision ANPR kameralari va mahalliy shlagbaum boshqaruv platasidan keladigan signallarni cloud server bilan sinxronizatsiya qiluvchi lokal tunnel-agent dasturi.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {user ? (
                      <a href="https://github.com/abdullayevaziz2006-arch/smartpark-shlagbaum/releases/download/v1.0.0/Shlagbaun.zip" target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', background: '#0ea5e9' }}>
                        <Download size={16} /> Yuklab Olish (Zip Paket)
                      </a>
                    ) : (
                      <button onClick={() => { setAuthMode('login'); setError(''); setAuthModalOpen(true); }} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', background: '#0ea5e9' }}>
                        <Download size={16} /> Yuklab olish uchun kiring
                      </button>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tizim: Windows 10/11 x64, Node JS v18+</span>
                  </div>
                </div>
              </div>
 
              {/* Card 2: SmartAccess Terminal Agent */}
              <div className="card" style={{ padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '14px', borderRadius: '12px' }}><Laptop size={28} /></div>
                <div style={{ flex: 1 }}>
                  <h3 className="outfit" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>SmartAccess QR Terminal Client (v1.1.0)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 16px 0' }}>
                    Bog'larga kirish joyidagi turniket terminallari (Hikvision/Dahua) bilan bog'lanib, shtrix va QR kodlarni onlayn tekshiruvchi va ruxsat beruvchi terminal dasturi.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {user ? (
                      <a href="https://github.com/abdullayevaziz2006-arch/xiva-lokomotiv-qr/releases/download/v1.0.0/smart-access.zip" target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', background: '#6366f1' }}>
                        <Download size={16} /> Yuklab Olish (Zip Paket)
                      </a>
                    ) : (
                      <button onClick={() => { setAuthMode('login'); setError(''); setAuthModalOpen(true); }} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', background: '#6366f1' }}>
                        <Download size={16} /> Yuklab olish uchun kiring
                      </button>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tizim: Windows 10/11, Port: 8090</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Hikvision iVMS-4200 Lite */}
              <div className="card" style={{ padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', opacity: 0.9 }}>
                <div style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b', padding: '14px', borderRadius: '12px' }}><Tv size={28} /></div>
                <div style={{ flex: 1 }}>
                  <h3 className="outfit" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Hikvision iVMS-4200 Lite (Alarm Client)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 16px 0' }}>
                    Kamera va turniketlarni dastlabki sozlash, IP manzillarni belgilash va tarmoqdagi Hikvision uskunalarini aniqlash uchun rasmiy Hikvision yordamchi dasturi.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <a href="https://www.hikvision.com/en/support/download/software/ivms-4200-series/" target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                      <ExternalLink size={16} /> Hikvision rasmiy saytidan yuklash
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* O'rnatish bo'yicha qo'llanma (Setup Guide) */}
            <div id="setup-guide" className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px' }}>
              <h3 className="outfit" style={{ fontSize: '1.6rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={24} color="var(--primary)" /> O'rnatish Qo'llanmasi
              </h3>
              
              {/* Tab headers */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px', gap: '15px' }}>
                <button 
                  onClick={() => setActiveTab('agent')}
                  style={{ 
                    padding: '8px 16px', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeTab === 'agent' ? '2px solid #0ea5e9' : '2px solid transparent',
                    color: activeTab === 'agent' ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  SmartPark Agent
                </button>
                <button 
                  onClick={() => setActiveTab('terminal')}
                  style={{ 
                    padding: '8px 16px', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeTab === 'terminal' ? '2px solid #6366f1' : '2px solid transparent',
                    color: activeTab === 'terminal' ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Terminal Client
                </button>
              </div>

              {/* Tab Content 1: Agent */}
              {activeTab === 'agent' && (
                <div>
                  <ol style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Faylni yuklab oling:</strong> `smartpark-agent.zip` arxivini yuklab oling va uni D:\ diskida (masalan, `D:\TUNEL`) papkaga chiqaring.
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Sozlamalarni tekshiring:</strong> `config.json` yoki `.env` faylida o'zingizning Cloud API URL manzilini hamda local kameralar IP manzillarini kiriting.
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Tizimga ulang:</strong> Terminalni (PowerShell) ochib, `npm install` va keyin `node agent.js` buyrug'ini bering. Dastur CloudFlare Tunnel orqali cloud serverga ulanadi va statik IP-siz ishlay boshlaydi.
                    </li>
                  </ol>
                  <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--bg-sub)', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    💡 <strong>Maslahat:</strong> Agent dasturi kompyuter o'chib yonganida avtomatik ishga tushishi uchun Windows Task Scheduler-da "Start at startup" rejimini yoqing.
                  </div>
                </div>
              )}

              {/* Tab Content 2: Terminal */}
              {activeTab === 'terminal' && (
                <div>
                  <ol style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Arxivdan chiqaring:</strong> `smartaccess-client.zip` faylini yuklab olib, turniket kompyuteriga o'rnating.
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>IP-larni sozlang:</strong> Turniket (Hikvision Terminal) IP manzili va Kassir kompyuteri bir xil lokal tarmoqda (LAN) bo'lishi kerak.
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Integratsiyani faollashtiring:</strong> Dasturni ishga tushiring. Tizim avtomatik ravishda chipta QR kodlarini skanerdan o'tkazadi va turniketga `ISAPI/AccessControl/AcsEvent` so'rovi orqali ruxsat yuboradi.
                    </li>
                  </ol>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* PRODUCT MODAL */}
      {activeProduct && (
        <div className="modal-overlay fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setActiveProduct(null)}>
          <div className="modal-content scale-up" style={{
            background: 'var(--bg-main)', maxWidth: '800px', width: '100%',
            borderRadius: '32px', overflow: 'hidden', position: 'relative',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveProduct(null)} style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'var(--bg-sub)', border: 'none', padding: '10px',
              borderRadius: '50%', cursor: 'pointer', zIndex: 10,
              color: 'var(--text-main)'
            }}><X size={20} /></button>

            {activeProduct === 'qr' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', padding: '50px 40px', color: 'white' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', color: 'white' }}>SmartAccess QR</h2>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>Barcha turdagi istirohat bog'lari va ko'ngilochar maskanlar uchun mukammal nazorat tizimi.</p>
                </div>
                <div style={{ padding: '40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#6366f1' }}><QrCode size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Shtrix va QR Kodli Biletlar</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Har bir mehmon uchun individual va bir martalik xavfsiz QR-kodlar orqali chiptalar sotish tizimi.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#6366f1' }}><Smartphone size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Hikvision integratsiyasi</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Turniket va terminallar orqali avtomatik tekshirish va kirish ta'minlanadi.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#6366f1' }}><BarChart3 size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Jonli Statistika va Hisobotlar</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Admin va rahbarlar uchun real vaqt rejimida tushumlar, kassirlar hisoboti va mehmonlar oqimi.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#6366f1' }}><ShieldCheck size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Firibgarlikdan Himoyalangan</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Biletlardan faqat bir marta foydalanish va muddati o'tgan biletlarni bloklash tizimi.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={() => {
                        setActiveProduct(null);
                        navigate('/login');
                      }}
                      className="btn-primary" 
                      style={{ flex: 1, padding: '20px', borderRadius: '16px', fontSize: '1.1rem', background: '#6366f1' }}
                    >
                      SmartAccess Live Demo paneliga kirish
                    </button>
                    <a 
                      href="#download"
                      onClick={() => setActiveProduct(null)}
                      className="btn-secondary" 
                      style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', border: '1px solid var(--border)' }}
                    >
                      <Download size={20} /> Terminalni yuklash
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeProduct === 'parking' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', padding: '50px 40px', color: 'white' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', color: 'white' }}>SmartPark Shlagbaum</h2>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>ANPR (avtomatlashtirilgan raqam tanish) va kameralar integratsiyasiga ega aqlli avtoturargoh tizimi.</p>
                </div>
                <div style={{ padding: '40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#0ea5e9' }}><Target size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>ANPR (Kamera Orqali Raqam Tanish)</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Hikvision ANPR kameralari yordamida mashina raqamini aniqlash va shlagbaunni avtomatik ochish.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#0ea5e9' }}><Tv size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>RTSP Stream & Snapshot</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Kirish va chiqishdagi avtomobillarning rasmlarini hamda kameralar jonli videosini (stream) boshqaruv panelida ko'rish.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#0ea5e9' }}><BarChart3 size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Tushum va Seanslar Nazorati</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Avtomobil qancha vaqt qolgani, belgilangan tarif bo'yicha to'lovlar va kassa tushumlarining to'liq hisoboti.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ color: '#0ea5e9' }}><Smartphone size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Telegram va SMS Xabarnomalar</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Avtomat ochilgan shlagbaumlar, kunlik umumiy daromadlar va maxsus hisobotlarni telegram guruhiga rasmi bilan yuborish.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={() => {
                        setActiveProduct(null);
                        // Open demo parking panel
                        window.open('http://localhost:3000', '_blank');
                      }}
                      className="btn-primary" 
                      style={{ flex: 1, padding: '20px', borderRadius: '16px', fontSize: '1.1rem', background: '#0ea5e9' }}
                    >
                      SmartPark Live Demo (Localhost:3000)
                    </button>
                    <a 
                      href="#download"
                      onClick={() => {
                        setActiveProduct(null);
                        setActiveTab('agent');
                      }}
                      className="btn-secondary" 
                      style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', border: '1px solid var(--border)' }}
                    >
                      <Download size={20} /> Shlagbaum Agent yuklash
                    </a>
                  </div>
                </div>
              </div>
            )}

            {(activeProduct === 'skud' || activeProduct === 'finance') && (
              <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-sub)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Smartphone size={48} color="#94a3b8" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>Tez Kunda...</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Ushbu modul hozirda ishlab chiqish jarayonida. SmartAccess platformasining yangi imkoniyatlaridan birinchilar bo'lib foydalanish uchun biz bilan bog'laning.</p>
                <button onClick={() => setActiveProduct(null)} className="btn-primary" style={{ marginTop: '32px', padding: '16px 40px' }}>Yopish</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTACT SECTION */}
      <section id="contact" style={{ backgroundColor: '#0f172a', color: 'white', padding: '100px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
          <div>
            <h2 className="outfit" style={{ fontSize: '3rem', color: 'white', marginBottom: '24px' }}>Savollar bormi?</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '48px' }}>
              Biz bilan bog'laning va biz sizning loyihangizni birgalikda reallashtiramiz. Biz sizga xavfsiz va avtomatlashtirilgan yechimlarni taqdim etamiz.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Phone color="var(--primary)" />
                <span style={{ fontSize: '1.1rem' }}>+998 91 123 45 67</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Mail color="var(--primary)" />
                <span style={{ fontSize: '1.1rem' }}>info@smartaccess.uz</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MapPin color="var(--primary)" />
                <span style={{ fontSize: '1.1rem' }}>O'zbekiston, Toshkent sh., Chilonzor tumani</span>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '40px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="outfit" style={{ marginBottom: '24px', color: 'white' }}>Xabaringizni qoldiring</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input type="text" placeholder="Ismingiz" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', outline: 'none' }} />
              <input type="email" placeholder="Email manzilingiz" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', outline: 'none' }} />
              <textarea placeholder="Xabaringiz" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', outline: 'none', height: '120px' }}></textarea>
              <button className="btn-primary" style={{ justifyContent: 'center' }}>Xabarni Yuborish</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>© 2026 SmartAccess IT Solutions. Barcha huquqlar himoyalangan.</p>
      </footer>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(10px)',
          zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setAuthModalOpen(false)}>
          <div style={{
            background: 'var(--bg-sub)', maxWidth: '400px', width: '100%',
            borderRadius: '24px', padding: '32px', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(14, 165, 233, 0.15)',
            border: '1px solid var(--border)'
          }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setAuthModalOpen(false)} style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
            }}><X size={20} /></button>

            {authMode === 'login' && (
              <form onSubmit={handleLogin}>
                <h3 className="outfit" style={{ fontSize: '1.6rem', marginBottom: '24px', textAlign: 'center' }}>Tizimga Kirish</h3>
                
                {error && <div style={{ color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Telefon raqami yoki Email</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+998901234567" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Parol</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '20px' }}>
                  {loading ? 'Kirilmoqda...' : 'Kirish'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div id="google-signin-btn" style={{ minHeight: '40px', display: 'flex', justifyContent: 'center' }}></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Hisobingiz yo'qmi? <span onClick={() => { setAuthMode('register'); setError(''); }} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Ro'yxatdan o'tish</span>
                  </span>
                </div>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegister}>
                <h3 className="outfit" style={{ fontSize: '1.6rem', marginBottom: '20px', textAlign: 'center' }}>Ro'yxatdan O'tish</h3>
                
                {error && <div style={{ color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tashkilot nomi (masalan, Xiva Park)</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>To'liq ismingiz</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Telefon raqami</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+998901234567" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Parol (Lokal dastur uchun)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>
                  {loading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div id="google-signin-btn" style={{ minHeight: '40px', display: 'flex', justifyContent: 'center' }}></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Hisobingiz bormi? <span onClick={() => { setAuthMode('login'); setError(''); }} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Tizimga kirish</span>
                  </span>
                </div>
              </form>
            )}

            {authMode === 'google-password' && (
              <form onSubmit={handleGooglePasswordSubmit}>
                <h3 className="outfit" style={{ fontSize: '1.5rem', marginBottom: '16px', textAlign: 'center' }}>Parol O'rnatish</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
                  Google orqali ro'yxatdan o'tish muvaffaqiyatli. Endi shlagbaum kompyuteridagi dasturga offline kira olishingiz uchun o'zingizga parol o'rnating.
                </p>

                {error && <div style={{ color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Yangi Parol</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#1e293b', color: 'white', outline: 'none' }} />
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Tasdiqlanmoqda...' : "Tizimni faollashtirish"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

