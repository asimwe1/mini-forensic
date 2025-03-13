from scapy.all import rdpcap, PcapReader
import subprocess
import json

def analyze_with_scapy(pcap_file):
    packets = rdpcap(pcap_file)
    scapy_results = []
    for packet in packets:
        scapy_results.append(packet.summary())
    return scapy_results

def analyze_with_tshark(pcap_file):
    tshark_command = f"tshark -r {pcap_file} -T json -e ip.src -e ip.dst -e tcp.port -e http.request.method"
    process = subprocess.Popen(tshark_command.split(), stdout=subprocess.PIPE)
    output, _ = process.communicate()
    tshark_results = json.loads(output)
    return tshark_results

def compare_results(scapy_results, tshark_results):
    # This is a simple comparison function. You can enhance it based on your requirements.
    comparison = {
        "scapy_count": len(scapy_results),
        "tshark_count": len(tshark_results),
        "scapy_results": scapy_results,
        "tshark_results": tshark_results
    }
    return comparison

def analyze_and_compare(pcap_file):
    scapy_results = analyze_with_scapy(pcap_file)
    tshark_results = analyze_with_tshark(pcap_file)
    comparison = compare_results(scapy_results, tshark_results)
    return comparison

if __name__ == "__main__":
    pcap_file = "upload.pcap"
    results = analyze_and_compare(pcap_file)
    print(json.dumps(results, indent=4))