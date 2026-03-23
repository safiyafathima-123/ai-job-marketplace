async function runTest() {
  console.log("Submitting heavy job...");
  const res = await fetch('http://localhost:5000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Heavy GPU Job Config Test',
      jobType: 'gpu-training',
      budget: 0.06,
      details: 'Large dataset'
    })
  });
  const data = await res.json();
  console.log("Response:", data);
  const jobId = data.job?.id || data.id;
  if (!jobId) throw new Error("No job ID found");
  console.log("Job Created:", jobId);

  let status = data.job?.status || data.status;
  while(status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 1000));
    const pRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
    const pData = await pRes.json();
    const j = pData.job || pData;
    status = j.status;
    console.log(`Status: ${status} | Distributed: ${j.isDistributed} | Subtasks: ${j.subTasks?.length || 0}`);
  }
  
  console.log("Final job state:");
  const finalRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
  const finalData = await finalRes.json();
  console.dir(finalData.job || finalData, { depth: null });
}
runTest();
