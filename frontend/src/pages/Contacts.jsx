import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, Trash2 } from "lucide-react";
import api from "../api/client";
import Loading from "../components/Loading";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/contacts");
      setContacts(data.contacts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.post("/contacts", {
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        relationship: form.get("relationship"),
        isPrimary: form.get("isPrimary") === "on"
      });
      event.currentTarget.reset();
      toast.success("Contact saved");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function remove(id) {
    await api.delete(`/contacts/${id}`);
    toast.success("Contact removed");
    load();
  }

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-safety-green">Emergency contacts</p>
        <h1 className="text-3xl font-black">Trusted people</h1>
      </div>
      <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="card grid gap-3">
          <label className="label">Name<input className="input" name="name" required /></label>
          <label className="label">Phone<input className="input" name="phone" required /></label>
          <label className="label">Email<input className="input" name="email" type="email" required /></label>
          <label className="label">Relationship<input className="input" name="relationship" placeholder="Family, friend, guide" /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="isPrimary" type="checkbox" /> Primary contact</label>
          <button className="btn-primary">Add contact</button>
        </form>
        <div className="grid gap-3">
          {loading ? <Loading /> : contacts.map((contact) => (
            <article key={contact._id} className="card flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black">{contact.name} {contact.isPrimary && <Star className="inline text-safety-amber" size={16} />}</h2>
                <p className="text-sm text-slate-500">{contact.relationship} · {contact.phone} · {contact.email}</p>
              </div>
              <button className="btn-secondary" onClick={() => remove(contact._id)}><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
