import React, { useContext, useEffect, useState, useRef } from 'react';
import './Mensajes.css';
import { UserContext } from '../../context/UserContext';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from '../../connection/firebaseConfig';
import IconForo from "../../assets/Foro.png";

const MensajesMenu = () => {
  const { currentUser } = useContext(UserContext);
  const [contacts, setContacts] = useState([]);
  const [conversationContacts, setConversationContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [mensajeInput, setMensajeInput] = useState('');
  const messagesListRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchContacts();
    fetchConversationContacts();
  }, [currentUser]);

  const fetchContacts = async () => {
    const q = query(collection(firestore, "users"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.email !== currentUser.email) {
        users.push(user);
      }
    });
    setContacts(users);
  };

  const fetchConversationContacts = async () => {
    const sentQuery = query(collection(firestore, "messages"), where("senderEmail", "==", currentUser.email), orderBy("timestamp", "desc"));
    const receivedQuery = query(collection(firestore, "messages"), where("receiverEmail", "==", currentUser.email), orderBy("timestamp", "desc"));
    const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)]);
    const contactsMap = new Map();

    sentSnapshot.forEach((doc) => {
      const contact = doc.data();
      if (!contactsMap.has(contact.receiverEmail)) {
        contactsMap.set(contact.receiverEmail, {
          email: contact.receiverEmail,
          username: contact.receiverUsername,
          role: contact.receiverRole,
          lastMessageDate: contact.timestamp
        });
      }
    });

    receivedSnapshot.forEach((doc) => {
      const contact = doc.data();
      if (!contactsMap.has(contact.senderEmail)) {
        contactsMap.set(contact.senderEmail, {
          email: contact.senderEmail,
          username: contact.senderUsername,
          role: contact.senderRole,
          lastMessageDate: contact.timestamp
        });
      } else {
        if (contact.timestamp > contactsMap.get(contact.senderEmail).lastMessageDate) {
          contactsMap.set(contact.senderEmail, {
            email: contact.senderEmail,
            username: contact.senderUsername,
            role: contact.senderRole,
            lastMessageDate: contact.timestamp
          });
        }
      }
    });

    const contacts = Array.from(contactsMap.values()).sort((a, b) => b.lastMessageDate - a.lastMessageDate);
    setConversationContacts(contacts);
  };

  const fetchMessages = async (contactEmail) => {
    const q = query(
      collection(firestore, "messages"),
      where("senderEmail", "in", [currentUser.email, contactEmail]),
      where("receiverEmail", "in", [currentUser.email, contactEmail]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      setMessages(messages);
      scrollToBottom();
    });
    return unsubscribe;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesListRef.current) {
        messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
      }
    }, 200);
  };

  const handleContactClick = async (contact) => {
    setSelectedContact(contact);
    const unsubscribe = await fetchMessages(contact.email);
    return () => unsubscribe();
  };

  const handleBackClick = () => {
    setSelectedContact(null);
  };

  const handleMensajeSubmit = async (e) => {
    e.preventDefault();
    if (!mensajeInput.trim() || !selectedContact) return;

    const newMensaje = {
      senderEmail: currentUser.email,
      senderUsername: currentUser.username,
      senderRole: currentUser.role,
      receiverEmail: selectedContact.email,
      receiverUsername: selectedContact.username,
      receiverRole: selectedContact.role,
      contenido: mensajeInput,
      timestamp: new Date(),
    };

    await addDoc(collection(firestore, "messages"), newMensaje);
    setMensajeInput('');
    scrollToBottom();
  };

  return (
    <div className='page-container' style={{
      display: 'flex',
      height: '100vh',
      overflowY: 'auto',
    }}>
      <div className='chat-container' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            <div className='chat-header'>
              <button className='back-button' onClick={handleBackClick}><FaArrowLeft /></button>
              <h3>{selectedContact.username}</h3>
            </div>
            <div className='messages-list' ref={messagesListRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.senderEmail === currentUser.email ? 'sent' : 'received'}`}>
                  <p>{msg.contenido}</p>
                  <span className='timestamp'>{new Date(msg.timestamp.toDate()).toLocaleTimeString()}</span>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>
            <form className='message-form' onSubmit={handleMensajeSubmit}>
              <input
                type="text"
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className='message-input'
              />
              <button type="submit"><FaPaperPlane /></button>
            </form>
          </>
        ) : (
          <div className='no-chat'>
            <p>Selecciona un chat para empezar a conversar.</p>
          </div>
        )}
      </div>
      <div className='sidebar' style={{ width: '300px', overflowY: 'auto', borderLeft: '1px solid #ddd' }}>
        <div className='sidebar-header'>
          <img src={IconForo} alt="Foro" className='sidebar-logo' />
        </div>
        <h2>Mensajes Recientes</h2>
        <div className='contacts-list'>
          {conversationContacts.length === 0 ? (
            <p>No hay conversaciones abiertas.</p>
          ) : (
            conversationContacts.map((contact) => (
              <div key={contact.email} className='contact-item' onClick={() => handleContactClick(contact)}>
                <p>{contact.username}</p>
              </div>
            ))
          )}
        </div>
        <h2>Otros usuarios</h2>
        <div className='contacts-list'>
          {contacts.length === 0 ? (
            <p>No hay usuarios disponibles.</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.email} className='contact-item' onClick={() => handleContactClick(contact)}>
                <p>{contact.username}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );  
};

export default MensajesMenu;
