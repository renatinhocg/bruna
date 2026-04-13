/*
  =========================
  MENU DE USUÁRIO DESABILITADO TEMPORARIAMENTE
  =========================
*/

// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// function isAuthenticated() {
//   return Boolean(localStorage.getItem('token'));
// }

// export default function UserMenu() {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef();
//   const navigate = useNavigate();

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   if (!isAuthenticated()) return null;

//   return (
//     <div className="user-menu-container" ref={menuRef}>
//       <button
//         className="user-menu-btn"
//         onClick={() => setOpen(o => !o)}
//         aria-haspopup="true"
//         aria-expanded={open}
//       >
//         <span role="img" aria-label="Usuário">👤</span>
//       </button>
//       {open && (
//         <div className="user-menu-dropdown">
//           <button className="user-menu-item" style={{color:'#222'}} onClick={() => { setOpen(false); navigate('/meus-testes'); }}>Meus Testes</button>
//           <button className="user-menu-item" style={{color:'#222'}} onClick={() => { setOpen(false); navigate('/minhas-compras'); }}>Minhas Compras</button>
//           <button className="user-menu-item" onClick={() => { setOpen(false); localStorage.removeItem('token'); navigate('/'); window.location.reload(); }} style={{ color: '#ef4444' }}>Sair</button>
//         </div>
//       )}
//     </div>
//   );
// }
