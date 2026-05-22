import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit3, Star, Trash2 } from "lucide-react";
import api from "../api/client";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  placeId: "",
  placeName: "",
  category: "attraction",
  safety: 5,
  cleanliness: 5,
  crowd: 3,
  scamRisk: 2,
  hospitality: 5,
  comment: ""
};

const categories = ["attraction", "monument", "restaurant", "cafe", "hotel", "hospital", "police", "atm", "pharmacy"];

export default function Reviews() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const myReviewIds = useMemo(() => new Set(reviews.filter((review) => review.user?._id === user?.id).map((review) => review._id)), [reviews, user?.id]);

  async function loadReviews() {
    setLoading(true);
    try {
      const [reviewResponse, statsResponse] = await Promise.all([
        api.get("/reviews"),
        api.get("/reviews/stats")
      ]);
      setReviews(reviewResponse.data.reviews);
      setStats(statsResponse.data.stats);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitReview(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        safety: Number(form.safety),
        cleanliness: Number(form.cleanliness),
        crowd: Number(form.crowd),
        scamRisk: Number(form.scamRisk),
        hospitality: Number(form.hospitality)
      };
      if (editingId) {
        await api.put(`/reviews/${editingId}`, payload);
        toast.success("Review updated");
      } else {
        await api.post("/reviews", payload);
        toast.success("Review saved");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadReviews();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(review) {
    setEditingId(review._id);
    setForm({
      placeId: review.placeId,
      placeName: review.placeName,
      category: review.category,
      safety: review.safety,
      cleanliness: review.cleanliness,
      crowd: review.crowd,
      scamRisk: review.scamRisk,
      hospitality: review.hospitality,
      comment: review.comment
    });
  }

  async function deleteReview(id) {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      await loadReviews();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-safety-green">Verified reviews</p>
        <h1 className="text-3xl font-black">Tourist safety ratings</h1>
      </div>

      <section className="grid gap-4 lg:grid-cols-[390px_1fr]">
        <form className="card grid gap-3" onSubmit={submitReview}>
          <h2 className="text-xl font-black">{editingId ? "Edit review" : "Submit review"}</h2>
          <input className="input" placeholder="Place ID, e.g. india-gate" value={form.placeId} onChange={(event) => updateField("placeId", event.target.value)} required />
          <input className="input" placeholder="Place name" value={form.placeName} onChange={(event) => updateField("placeName", event.target.value)} required />
          <select className="input" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <RatingInput label="Safety" name="safety" value={form.safety} onChange={updateField} />
          <RatingInput label="Cleanliness" name="cleanliness" value={form.cleanliness} onChange={updateField} />
          <RatingInput label="Crowd comfort" name="crowd" value={form.crowd} onChange={updateField} />
          <RatingInput label="Scam risk" name="scamRisk" value={form.scamRisk} onChange={updateField} />
          <RatingInput label="Hospitality" name="hospitality" value={form.hospitality} onChange={updateField} />
          <textarea className="input min-h-28" placeholder="Add practical safety details for other tourists" value={form.comment} onChange={(event) => updateField("comment", event.target.value)} required />
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save review"}</button>
            {editingId && <button className="btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</button>}
          </div>
        </form>

        <div className="grid gap-4">
          <section className="card">
            <h2 className="text-xl font-black">Stored rating stats</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((item) => (
                <article key={item._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="font-black">{item.placeName}</p>
                  <p className="text-sm text-slate-500">{item.count} review{item.count === 1 ? "" : "s"}</p>
                  <p className="mt-2 flex items-center gap-1 font-black text-safety-green"><Star size={16} /> {Number(item.safetyIndex || 0).toFixed(1)} safety</p>
                </article>
              ))}
              {!stats.length && <p className="text-sm text-slate-500">No rating stats yet.</p>}
            </div>
          </section>

          <section className="grid gap-3">
            {loading ? <Loading /> : reviews.map((review) => (
              <article key={review._id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-cyan-400">{review.category}</p>
                    <h2 className="text-xl font-black">{review.placeName}</h2>
                    <p className="text-sm text-slate-500">by {review.user?.name || "Verified tourist"}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{review.safety}/5 safety</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{review.comment}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">Spam risk score: {review.fakeReviewScore}/100</p>
                {myReviewIds.has(review._id) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-secondary" type="button" onClick={() => startEdit(review)}><Edit3 size={16} /> Edit</button>
                    <button className="btn-secondary" type="button" onClick={() => deleteReview(review._id)}><Trash2 size={16} /> Delete</button>
                  </div>
                )}
              </article>
            ))}
            {!loading && !reviews.length && <p className="text-slate-500">No reviews submitted yet.</p>}
          </section>
        </div>
      </section>
    </main>
  );
}

function RatingInput({ label, name, value, onChange }) {
  return (
    <label className="label">
      {label}: {value}
      <input min="1" max="5" step="1" type="range" value={value} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  );
}
