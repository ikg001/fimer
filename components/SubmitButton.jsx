export default function SubmitButton({ label, onClick, isLoading = false, type = 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? 'Gönderiliyor...' : label}
    </button>
  );
} 