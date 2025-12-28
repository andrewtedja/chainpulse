"use client";

import React, { useEffect, useState } from "react";

const TestFetchPage = () => {
	const [text, setText] = useState("");

	useEffect(() => {
		const handleTestFetch = async () => {
			const res = await fetch("http://localhost:8000/");
			const json = await res.json();
			setText(json.text);
		};

		handleTestFetch();
	}, []);

	return <div>{text}</div>;
};

export default TestFetchPage;
