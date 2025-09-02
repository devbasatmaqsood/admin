import Link from "next/link";

export default function Custom404() {

    return (
        <div style={{ textAlign: "center", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "black" }}>
            <h1>WE ARE SORRY, PAGE NOT FOUND!</h1>
            <p style={{ marginTop: "12px" }}>The page you're looking for might have been removed had its name changed or is temporarily unavailable.</p>
            <span
                style={{
                    marginTop: "30px",
                    display: "inline-block",
                    backgroundColor: "#313D41",
                    padding: "9px 16px",
                    borderRadius: "5px",
                    color: "white"
                }}
            >
                <Link href="/" style={{ color: "white", textDecoration: "none" }}>
                    Back To Homepage
                </Link>
            </span>
        </div>
    );
}
