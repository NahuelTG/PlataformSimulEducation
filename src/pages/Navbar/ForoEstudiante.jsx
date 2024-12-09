import React, { useState, useEffect, useContext, useRef } from "react";
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../connection/firebaseConfig";
import { UserContext } from "../../context/UserContext";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import styles from "./Foro.module.css";

const Foro = () => {
    const { currentUser } = useContext(UserContext);
    const [contacts, setContacts] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [conversationContacts, setConversationContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [mensajeInput, setMensajeInput] = useState("");
    const messagesListRef = useRef(null);
    const bottomRef = useRef(null);
    const userListRef = useRef(null);
    const adminListRef = useRef(null);
    const conversationListRef = useRef(null);

    useEffect(() => {
        fetchContacts();
        fetchAdmins();
        fetchConversationContacts();
    }, [currentUser]);

    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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

    const fetchAdmins = async () => {
        const q = query(collection(firestore, "users"), where("role", "==", "admin"));
        const querySnapshot = await getDocs(q);
        const adminsList = [];
        querySnapshot.forEach((doc) => {
            adminsList.push(doc.data());
        });
        setAdmins(adminsList);
    };

    const fetchConversationContacts = async () => {
        const sentQuery = query(
            collection(firestore, "messages"),
            where("senderEmail", "==", currentUser.email),
            orderBy("timestamp", "desc")
        );
        const receivedQuery = query(
            collection(firestore, "messages"),
            where("receiverEmail", "==", currentUser.email),
            orderBy("timestamp", "desc")
        );
        const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)]);
        const contactsMap = new Map();

        sentSnapshot.forEach((doc) => {
            const contact = doc.data();
            if (!contactsMap.has(contact.receiverEmail)) {
                contactsMap.set(contact.receiverEmail, {
                    email: contact.receiverEmail,
                    username: contact.receiverUsername,
                    role: contact.receiverRole,
                    lastMessageDate: contact.timestamp,
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
                    lastMessageDate: contact.timestamp,
                });
            } else {
                if (contact.timestamp > contactsMap.get(contact.senderEmail).lastMessageDate) {
                    contactsMap.set(contact.senderEmail, {
                        email: contact.senderEmail,
                        username: contact.senderUsername,
                        role: contact.senderRole,
                        lastMessageDate: contact.timestamp,
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
                const message = doc.data();
                if (message.senderEmail !== message.receiverEmail) {
                    messages.push(message);
                }
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

    const handleContactClick = async (contact, listRef) => {
        setSelectedContact(contact);
        const unsubscribe = await fetchMessages(contact.email);
        setTimeout(() => {
            scrollToBottom();
            if (listRef.current) {
                listRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 100);
        return () => unsubscribe();
    };

    const handleBackClick = () => {
        setSelectedContact(null);
        setTimeout(() => {
            fetchConversationContacts();
        }, 100);
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
        setMensajeInput("");
        scrollToBottom();
    };

    return (
        <div className={styles.foroContainer}>
            <div className={styles.userList}>
                {/* Lista de Contactos de Conversación */}
                <div ref={conversationListRef} className={styles.section}>
                    <h3>Contactos de Conversación</h3>
                    {conversationContacts.map((contact, index) => (
                        <div key={index} className={styles.contact} onClick={() => handleContactClick(contact, conversationListRef)}>
                            <p>{contact.username}</p>
                        </div>
                    ))}
                </div>
                
                {/* Lista de Usuarios */}
                <div ref={userListRef} className={styles.section}>
                    <h3>Usuarios</h3>
                    {contacts.map((contact, index) => (
                        <div key={index} className={styles.contact} onClick={() => handleContactClick(contact, userListRef)}>
                            <p>{contact.username}</p>
                        </div>
                    ))}
                </div>

                {/* Lista de Administradores */}
                <div ref={adminListRef} className={styles.section}>
                    <h3>Administradores</h3>
                    {admins.map((admin, index) => (
                        <div key={index} className={styles.contact} onClick={() => handleContactClick(admin, adminListRef)}>
                            <p>{admin.username} (Admin)</p>
                        </div>
                    ))}
                </div>
            </div>

            {selectedContact ? (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <button className={styles.backButton} onClick={handleBackClick}>
                            <FaArrowLeft />
                        </button>
                        <h2>{selectedContact.username}</h2>
                    </div>
                    <div ref={messagesListRef} className={styles.messages}>
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.senderEmail === currentUser.email ? styles.myMessage : styles.contactMessage}>
                                <p>{msg.contenido}</p>
                                <span className={styles.messageTime}>{formatTimestamp(msg.timestamp.toDate())}</span>
                            </div>
                        ))}
                    </div>
                    <form className={styles.inputContainer} onSubmit={handleMensajeSubmit}>
                        <input
                            type="text"
                            value={mensajeInput}
                            onChange={(e) => setMensajeInput(e.target.value)}
                            placeholder="Escribe un mensaje..."
                        />
                        <button type="submit"><FaPaperPlane /></button>
                    </form>
                </div>
            ) : (
                <div className={styles.chatWindow}>
                    <div className={styles.welcomeMessage}>
                        Selecciona un contacto para comenzar a chatear.
                    </div>
                </div>
            )}
        </div>
    );
};

export default Foro;
